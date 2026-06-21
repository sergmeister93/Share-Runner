#!/usr/bin/env node
/*
 * validate-project-setup.mjs — checks the setup-pass scaffold is present and honest.
 * Node built-ins only. Exit 0 = clean, exit 1 = at least one failure.
 *
 * Usage: node scripts/validate-project-setup.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, extname, relative } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const at = (...p) => join(ROOT, ...p);
const fails = [];
const fail = (m) => fails.push(m);
const read = (p) => readFileSync(p, "utf8");

// ---- 1) required files exist --------------------------------------------------
const required = [
  "CLAUDE.md", "AGENTS.md", "CODEX.md",
  "comms/KERNEL.md", "comms/PROJECT.md",
  ".agents/prompts/manager-agent.md",
  ".agents/prompts/backend-developer-agent.md",
  ".agents/prompts/ux-codex-agent.md",
  ".agents/prompts/qa-agent.md",
  ".agents/prompts/asset-pipeline-agent.md",
  ".agents/prompts/review-agent.md",
  ".agents/prompts/session-start-checklist.md",
  ".claude/skills/share-runner-project/SKILL.md",
  ".claude/skills/phaser-platformer/SKILL.md",
  ".claude/skills/game-architecture/SKILL.md",
  ".claude/skills/pixel-art-asset-safe/SKILL.md",
  ".claude/skills/asset-manifest-discipline/SKILL.md",
  ".claude/skills/multi-agent-comms/SKILL.md",
  ".claude/skills/frontend-design/SKILL.md",
  ".claude/skills/code-review-gate/SKILL.md",
  ".claude/skills/qa-verification/SKILL.md",
  "docs/design/GAME_DESIGN_BRIEF.md",
  "docs/architecture/REPO_STRUCTURE.md",
  "docs/assets/ASSET_MAP.md",
  "docs/workflow/MULTI_AGENT_WORKFLOW.md",
  "docs/workflow/BRANCHING_AND_REVIEW.md",
  "docs/skills/SKILLS_AND_PLUGINS_INVENTORY.md",
  "docs/skills/SKILL_STRATEGY.md",
  "docs/skills/PLUGIN_SETUP.md",
  "specs/level/baltimore_level_contract.md",
  "specs/contracts/event_bus_contract.md",
  "specs/contracts/game_state_contract.md",
  "specs/contracts/asset_loading_contract.md",
];
for (const f of required) if (!existsSync(at(f))) fail(`missing required file: ${f}`);

// ---- 2) root files reference the kernel/binding/skills ------------------------
for (const f of ["CLAUDE.md", "AGENTS.md", "CODEX.md"]) {
  if (!existsSync(at(f))) continue;
  const txt = read(at(f));
  if (!txt.includes("comms/KERNEL.md")) fail(`${f} does not reference comms/KERNEL.md`);
  if (!txt.includes("comms/PROJECT.md")) fail(`${f} does not reference comms/PROJECT.md`);
  if (!txt.includes("docs/skills/")) fail(`${f} does not reference docs/skills/`);
}

// ---- 3) PROJECT.md is bound, not template ------------------------------------
if (existsSync(at("comms/PROJECT.md"))) {
  const p = read(at("comms/PROJECT.md"));
  if (/<[a-z][a-z .\/_-]*>/i.test(p)) fail("comms/PROJECT.md still contains template placeholders like <name>");
  if (!/project:\s*Share-Runner/.test(p)) fail("comms/PROJECT.md missing 'project: Share-Runner'");
}

// ---- 4) every .claude/skills/*/SKILL.md has frontmatter w/ name + description --
const BUNDLED = new Set(["code-review"]); // names that must not be shadowed
const skillsDir = at(".claude/skills");
const seenNames = new Set();
if (existsSync(skillsDir)) {
  for (const dir of readdirSync(skillsDir)) {
    const skill = join(skillsDir, dir, "SKILL.md");
    if (!existsSync(skill)) continue;
    const txt = read(skill);
    const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) { fail(`.claude/skills/${dir}/SKILL.md has no YAML frontmatter`); continue; }
    const fm = m[1];
    const name = (fm.match(/^name:\s*(\S.*?)\s*$/m) || [])[1];
    const desc = (fm.match(/^description:\s*(\S.*?)\s*$/m) || [])[1];
    if (!name) fail(`.claude/skills/${dir}/SKILL.md frontmatter missing non-empty 'name'`);
    if (!desc) fail(`.claude/skills/${dir}/SKILL.md frontmatter missing non-empty 'description'`);
    if (name) {
      seenNames.add(name);
      if (BUNDLED.has(name)) fail(`.claude/skills/${dir} uses bundled name '${name}' (would shadow it); rename or document`);
    }
  }
}

// ---- 5) ponytail status recorded --------------------------------------------
const inv = existsSync(at("docs/skills/SKILLS_AND_PLUGINS_INVENTORY.md"))
  ? read(at("docs/skills/SKILLS_AND_PLUGINS_INVENTORY.md")) : "";
if (!/(?:FOUND|NOT_FOUND|PENDING_MANUAL_INSTALL)/.test(inv))
  fail("Ponytail status (FOUND|NOT_FOUND|PENDING_MANUAL_INSTALL) not recorded in SKILLS_AND_PLUGINS_INVENTORY.md");

// ---- 6) src/ has READMEs but no runtime impl files (unless pre-existing) ------
const RUNTIME = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".html", ".css"]);
function scan(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) scan(full);
    else if (RUNTIME.has(extname(e).toLowerCase()))
      fail(`runtime file present in src/ during setup pass: ${relative(ROOT, full)}`);
  }
}
scan(at("src"));

// ---- report ------------------------------------------------------------------
if (fails.length) {
  console.error(`setup validate — FAIL (${fails.length})`);
  for (const f of fails) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`setup validate — PASS (${required.length} files, ${seenNames.size} project skills)`);
