#!/usr/bin/env node
// One-command Phase 2 verification: artefacts fresh, client syntax, full proposal test
// suite, Phase 1 static checks (which also scan proposal/), and the public-tree fingerprint.
// Writes proposal/evidence/verification.json and proposal/evidence/test-output.txt only.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PROPOSAL_ROOT, POC_ROOT, REPO_ROOT } from '../src/build.mjs';
import { treeFingerprint } from '../src/snapshot.mjs';

const ev = join(PROPOSAL_ROOT, 'evidence');
mkdirSync(ev, { recursive: true });
const run = (args, cwd = POC_ROOT) => { const t = Date.now(); const r = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', maxBuffer: 64 << 20 }); return { cmd: `node ${args.join(' ')}`, exit: r.status, ms: Date.now() - t, out: r.stdout, err: r.stderr }; };

const out = { node: process.version, steps: {} };
const b = run(['proposal/scripts/build-proposal.mjs', '--check']);
out.steps.build_check = { cmd: b.cmd, exit: b.exit, output: (b.out + b.err).trim().split('\n').slice(0, 3).join(' ') };
const syn = run(['--check', 'proposal/component/wwk-sponsored.js']);
out.steps.client_syntax = { cmd: syn.cmd, exit: syn.exit };
const tests = readdirSync(join(PROPOSAL_ROOT, 'test')).filter((f) => f.endsWith('.test.mjs')).map((f) => `proposal/test/${f}`);
const t = run(['--test', '--test-reporter=spec', ...tests]);
writeFileSync(join(ev, 'test-output.txt'), t.out + (t.err ? `\n--- stderr ---\n${t.err}` : ''));
const n = (k) => Number((t.out.match(new RegExp(`ℹ ${k} (\\d+)`)) || [])[1]);
out.steps.tests = { cmd: t.cmd, exit: t.exit, ms: t.ms, tests: n('tests'), pass: n('pass'), fail: n('fail'), skipped: n('skipped') };
const sc = run(['scripts/static-checks.mjs']);
out.steps.static_checks = { cmd: sc.cmd, exit: sc.exit, result: JSON.parse(sc.out || '{}') };
const snap = JSON.parse(readFileSync(join(PROPOSAL_ROOT, 'source-snapshot.json'), 'utf8'));
const now = treeFingerprint(REPO_ROOT);
out.public_tree = { recorded: { file_count: snap.file_count, aggregate_sha256: snap.aggregate_sha256 }, now: { file_count: now.file_count, aggregate_sha256: now.aggregate_sha256 }, unchanged: now.aggregate_sha256 === snap.aggregate_sha256 && now.file_count === snap.file_count };
out.ok = b.exit === 0 && syn.exit === 0 && t.exit === 0 && sc.exit === 0 && out.public_tree.unchanged;
writeFileSync(join(ev, 'verification.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ ok: out.ok, build_check: b.exit, client_syntax: syn.exit, tests: out.steps.tests, static_checks: { exit: sc.exit, files: out.steps.static_checks.result.files_scanned, findings: (out.steps.static_checks.result.findings || []).length }, public_tree: out.public_tree }, null, 2));
process.exitCode = out.ok ? 0 : 1;
