#!/usr/bin/env node
/*
 * validate.mjs — the deterministic enforcer for the comms protocol.
 *
 * Reads the data plane (roster.jsonl, ledger.jsonl, PROJECT.md, and — in no-vcs
 * mode — manifest.json) and checks the KERNEL invariants that can be checked by a
 * machine. Exit 0 = clean; exit 1 = at least one ERROR. Warnings never fail unless
 * --strict is passed.
 *
 * Zero dependencies (Node built-ins only). Resilient to a fresh/empty project: a
 * project with no entries passes.
 *
 * Usage:  node comms/bin/validate.mjs [--strict]
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const COMMS = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(COMMS, "..");
const STRICT = process.argv.includes("--strict");

const TYPES = new Set([
  "session-start", "claim", "update", "handoff", "blocker", "decision", "result",
  "work-order", "nudge", "stop-the-line", "reassign", "escalation", "retro",
]);
const STATUSES = new Set([
  "open", "claimed", "blocked", "review", "ready-for-next", "complete", "superseded",
]);
// Statuses that mark a task no longer actively owned (so a new claim is legal).
const RELEASED = new Set(["complete", "superseded", "ready-for-next"]);

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ----- read a .jsonl file into records, skipping blanks and `_schema` markers ---
function readJsonl(path) {
  if (!existsSync(path)) return [];
  const out = [];
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      err(`${path}:${i + 1}: not valid JSON`);
      return;
    }
    if (obj && obj._schema) return; // self-documenting marker line
    out.push({ obj, line: i + 1 });
  });
  return out;
}

// ----- parse PROJECT.md for `key: value` settings -------------------------------
function readProject() {
  const p = join(COMMS, "PROJECT.md");
  const cfg = {};
  if (!existsSync(p)) return cfg;
  for (const raw of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = raw.match(/^\s*([a-z_]+):\s*(\S.*?)\s*(#.*)?$/);
    if (m && !raw.trim().startsWith("#")) cfg[m[1]] = m[2].replace(/\s+#.*$/, "").trim();
  }
  return cfg;
}

function detectGit() {
  if (existsSync(join(ROOT, ".git"))) return true;
  try { execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: ROOT, stdio: "ignore" }); return true; }
  catch { return false; }
}

// ------------------------------------------------------------------ main checks
const cfg = readProject();
const mode = cfg.execution_mode || (detectGit() ? "git" : "no-vcs");

// roster
const rosterRecs = readJsonl(join(COMMS, "roster.jsonl"));
const rosterIds = new Set(["human"]);
let managers = 0;
for (const { obj, line } of rosterRecs) {
  if (!obj.id) { err(`roster.jsonl:${line}: missing 'id'`); continue; }
  rosterIds.add(obj.id);
  if (obj.role === "manager") managers += 1;
  if (!obj.vendor) warn(`roster.jsonl:${line}: '${obj.id}' has no 'vendor'`);
  if (!Array.isArray(obj.capabilities)) warn(`roster.jsonl:${line}: '${obj.id}' has no 'capabilities' array`);
}
// Count distinct manager ids, not lines (re-registration across sessions is fine).
const managerIds = new Set(rosterRecs.filter(r => r.obj.role === "manager").map(r => r.obj.id));
if (managerIds.size > 1) err(`roster: ${managerIds.size} distinct managers (${[...managerIds].join(", ")}); the kernel allows exactly one`);

// ledger
const ledger = readJsonl(join(COMMS, "ledger.jsonl"))
  .map(r => r)
  .sort((a, b) => String(a.obj.ts || "").localeCompare(String(b.obj.ts || "")));

const tasks = new Map(); // task_id -> { events:[], owner, released, hasOpener }
for (const { obj, line } of ledger) {
  // 1) schema
  for (const f of ["ts", "agent", "type", "task_id", "status"]) {
    if (!obj[f]) err(`ledger.jsonl:${line}: missing required '${f}'`);
  }
  if (obj.type && !TYPES.has(obj.type)) err(`ledger.jsonl:${line}: unknown type '${obj.type}'`);
  if (obj.status && !STATUSES.has(obj.status)) err(`ledger.jsonl:${line}: unknown status '${obj.status}'`);

  // 2) identity
  if (obj.agent && !rosterIds.has(obj.agent)) err(`ledger.jsonl:${line}: author '${obj.agent}' is not in roster.jsonl (invariant 1)`);
  if (obj.owner && !rosterIds.has(obj.owner)) err(`ledger.jsonl:${line}: owner '${obj.owner}' is not in roster.jsonl`);
  if (obj.target_agent && !rosterIds.has(obj.target_agent) && obj.target_agent !== "next-session")
    warn(`ledger.jsonl:${line}: target_agent '${obj.target_agent}' is not in roster.jsonl`);

  // 4) done means verified
  if (obj.status === "complete") {
    const v = obj.verification;
    const okObj = v && typeof v === "object" && typeof v.exit === "number" && v.command;
    const okNotRun = v === "not-run" && obj.reason;
    if (!okObj && !okNotRun)
      err(`ledger.jsonl:${line}: status 'complete' for '${obj.task_id}' has no valid verification block (invariant 4)`);
  }

  // collect per-task
  if (obj.task_id) {
    if (!tasks.has(obj.task_id)) tasks.set(obj.task_id, { owner: null, released: true, hasOpener: false });
    const t = tasks.get(obj.task_id);
    if (["work-order", "claim"].includes(obj.type)) t.hasOpener = true;

    // 3 (ownership) double-claim detection
    if (obj.type === "claim") {
      if (t.owner && t.owner !== obj.agent && !t.released)
        err(`ledger.jsonl:${line}: '${obj.agent}' claims '${obj.task_id}' while '${t.owner}' still holds it (invariant 2: double-claim)`);
      t.owner = obj.agent; t.released = false;
    }
    if (obj.type === "work-order" && obj.owner) { t.owner = obj.owner; t.released = false; }
    if (obj.type === "reassign" && obj.owner) { t.owner = obj.owner; t.released = false; }
    if (RELEASED.has(obj.status) || ["handoff", "stop-the-line"].includes(obj.type)) t.released = true;
  }
}

// 4b) a completed task that never had a work-order/claim => likely a fragmented task_id
for (const [id, t] of tasks) {
  const completed = ledger.some(r => r.obj.task_id === id && r.obj.status === "complete");
  if (completed && !t.hasOpener)
    warn(`task '${id}' reaches 'complete' but has no work-order/claim — possible task_id mismatch (one task split across slugs)`);
}

// 6) durability / drift
if (mode === "no-vcs") {
  const mp = join(COMMS, "manifest.json");
  if (!existsSync(mp)) {
    warn("no-vcs mode but manifest.json is absent — artifact drift cannot be detected (invariant 6)");
  } else {
    let manifest = {};
    try { manifest = JSON.parse(readFileSync(mp, "utf8")); } catch { err("manifest.json: not valid JSON"); }
    for (const [rel, hash] of Object.entries(manifest)) {
      if (rel.startsWith("_")) continue;
      const f = join(ROOT, rel);
      if (!existsSync(f)) { err(`manifest: '${rel}' is listed but missing on disk (drift)`); continue; }
      const actual = createHash("sha256").update(readFileSync(f)).digest("hex");
      if (actual !== hash) err(`manifest: '${rel}' changed since last result — hash drift (invariant 3/6). Update the result + manifest.`);
    }
  }
} else {
  // git mode: best-effort durability signals
  try {
    const porcelain = execFileSync("git", ["status", "--porcelain"], { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    if (porcelain) {
      const dirty = porcelain.split(/\r?\n/).filter(l => !/comms(_new)?\//.test(l));
      if (dirty.length) warn(`git: ${dirty.length} uncommitted change(s) to tracked files — fine while working, but land code + ledger together (invariant 3)`);
    }
    // phantom-commit check: any result claiming a commit that doesn't exist
    for (const { obj, line } of readJsonl(join(COMMS, "ledger.jsonl"))) {
      if (obj.commit && obj.commit !== "uncommitted") {
        try { execFileSync("git", ["cat-file", "-e", `${obj.commit}^{commit}`], { cwd: ROOT, stdio: "ignore" }); }
        catch { err(`ledger.jsonl:${line}: references commit '${obj.commit}' which does not exist in this repo (phantom durability)`); }
      }
    }
  } catch {
    warn("git mode set but git is not available here — durability checks skipped");
  }
}

// ------------------------------------------------------------------ report
const tasksDone = [...tasks].filter(([id]) => ledger.some(r => r.obj.task_id === id && r.obj.status === "complete")).length;
console.log(`comms validate — ${mode} mode`);
console.log(`  roster:  ${rosterIds.size - 1} agent(s)${managerIds.size ? `, ${managerIds.size} manager` : ""}`);
console.log(`  ledger:  ${ledger.length} entr${ledger.length === 1 ? "y" : "ies"}, ${tasks.size} task(s), ${tasksDone} complete`);
if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length}):`);
  for (const w of warnings) console.log(`  ! ${w}`);
}
if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  for (const e of errors) console.log(`  ✗ ${e}`);
}
const failed = errors.length > 0 || (STRICT && warnings.length > 0);
console.log(`\nRESULT: ${failed ? "FAIL" : "PASS"}${STRICT ? " (strict)" : ""}`);
process.exit(failed ? 1 : 0);
