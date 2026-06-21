/**
 * generate-sfx.mjs — synthesizes the gameplay SFX as retro chiptune WAVs.
 *
 * sfxr-style synthesis: square/saw/noise waveforms + linear attack/release +
 * pitch slide. Pure Node, no deps, public-domain output. Re-run any time:
 *   npm run assets:sfx
 *
 * Output: assets/audio/sfx/{jump,land,collect,complete,locked}.wav
 * Keys/paths are declared in asset_library_manifest.json (manifest discipline);
 * this script only writes the files. Self-checks every WAV before exiting.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const SAMPLE_RATE = 44100;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'audio', 'sfx');

// --- waveforms over phase (cycles) ----------------------------------------------
const wave = {
  square: (p, duty = 0.5) => (p % 1 < duty ? 1 : -1),
  saw: (p) => 2 * (p % 1) - 1,
  sine: (p) => Math.sin(2 * Math.PI * p),
  noise: () => Math.random() * 2 - 1,
};

/** One tone with optional linear pitch slide and attack/release envelope. */
function tone({ type = 'square', freq, freqEnd = freq, duration, volume = 0.5, duty = 0.5, attack = 0.005, release = 0.04 }) {
  const n = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const f = freq + (freqEnd - freq) * (i / n);
    phase += f / SAMPLE_RATE;
    const t = i / SAMPLE_RATE;
    const rem = (n - i) / SAMPLE_RATE;
    let env = 1;
    if (t < attack) env = t / attack;
    if (rem < release) env = Math.min(env, rem / release);
    const s = type === 'noise' ? wave.noise() : wave[type](phase, duty);
    out[i] = s * env * volume;
  }
  return out;
}

const concat = (parts) => {
  const out = new Float32Array(parts.reduce((s, p) => s + p.length, 0));
  let off = 0;
  for (const p of parts) (out.set(p, off), (off += p.length));
  return out;
};

const mix = (...parts) => {
  const out = new Float32Array(Math.max(...parts.map((p) => p.length)));
  for (const p of parts) for (let i = 0; i < p.length; i++) out[i] += p[i];
  return out;
};

/** Scale down only if it would clip — keeps relative loudness, prevents overflow. */
function normalize(s, target = 0.9) {
  let peak = 0;
  for (const v of s) peak = Math.max(peak, Math.abs(v));
  if (peak > target) for (let i = 0; i < s.length; i++) s[i] *= target / peak;
  return s;
}

/** 16-bit PCM mono WAV. */
function encodeWav(samples) {
  const dataLen = samples.length * 2;
  const buf = Buffer.alloc(44 + dataLen);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataLen, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataLen, 40);
  for (let i = 0; i < samples.length; i++) {
    const c = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(c * 32767), 44 + i * 2);
  }
  return buf;
}

// --- the five gameplay sounds ----------------------------------------------------
const note = (freq, duration, volume = 0.42) => tone({ freq, duration, volume, release: 0.02 });

const sounds = {
  // rising square blip — lift-off
  jump: tone({ freq: 330, freqEnd: 760, duration: 0.13, volume: 0.5, release: 0.05 }),
  // low thud + noise burst — landing on a surface
  land: mix(
    tone({ freq: 160, freqEnd: 70, duration: 0.1, volume: 0.4, release: 0.07 }),
    tone({ type: 'noise', freq: 0, duration: 0.05, volume: 0.18, release: 0.045 }),
  ),
  // classic two-tone coin pickup (B5 -> E6)
  collect: concat([
    tone({ freq: 988, duration: 0.05, volume: 0.4, release: 0.01 }),
    tone({ freq: 1319, duration: 0.13, volume: 0.4, release: 0.08 }),
  ]),
  // ascending major arpeggio — level win (C5 E5 G5 C6)
  complete: concat([note(523, 0.1), note(659, 0.1), note(784, 0.1), note(1047, 0.24, 0.45)]),
  // low descending buzz — flag locked (not enough shares)
  locked: concat([
    tone({ freq: 200, freqEnd: 150, duration: 0.09, volume: 0.38, duty: 0.3, release: 0.02 }),
    tone({ freq: 150, freqEnd: 110, duration: 0.13, volume: 0.38, duty: 0.3, release: 0.06 }),
  ]),
};

await mkdir(outDir, { recursive: true });
for (const [name, samples] of Object.entries(sounds)) {
  normalize(samples);
  const buf = encodeWav(samples);

  // self-check: valid RIFF/WAVE header, declared data length, audible content
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF', `${name}: RIFF header`);
  assert.equal(buf.toString('ascii', 8, 12), 'WAVE', `${name}: WAVE header`);
  assert.equal(buf.readUInt32LE(40), samples.length * 2, `${name}: data length`);
  assert.ok(samples.every(Number.isFinite), `${name}: no NaN/Inf samples`);
  assert.ok(samples.some((v) => Math.abs(v) > 0.05), `${name}: not silent`);

  await writeFile(path.join(outDir, `${name}.wav`), buf);
  console.log(`  ${name}.wav  ${(buf.length / 1024).toFixed(1)} KB  ${(samples.length / SAMPLE_RATE).toFixed(2)}s`);
}
console.log(`sfx self-check PASS — ${Object.keys(sounds).length} WAVs written to assets/audio/sfx/`);
