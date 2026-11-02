#!/usr/bin/env node
// Territory SEO CLI. Offline: reads the repository, never fetches, deploys or contacts anyone.
//   node seo/cli.mjs audit [--json] [--map FILE] [--repo-root DIR]            exit 1 when any error
//   node seo/cli.mjs consolidate [--write] [--map FILE] [--repo-root DIR]      dry-run unless --write
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_REPO_ROOT } from '../src/repo.mjs';
import { DEFAULT_MAP, runAudit } from './src/audit.mjs';
import { toMarkdown } from './src/report.mjs';
import { planConsolidation } from './src/consolidate.mjs';

function parse(argv) {
  const [command, ...rest] = argv;
  const o = { command, map: DEFAULT_MAP, 'repo-root': DEFAULT_REPO_ROOT };
  for (let i = 0; i < rest.length; i += 1) {
    const a = rest[i];
    if (a === '--json' || a === '--write') o[a.slice(2)] = true;
    else if (a === '--map' || a === '--repo-root') { o[a.slice(2)] = rest[i + 1]; i += 1; }
    else throw new Error(`unknown option ${a}`);
  }
  if (!['audit', 'consolidate'].includes(command)) throw new Error('command must be audit or consolidate');
  return o;
}

export function main(argv = process.argv.slice(2), out = process.stdout) {
  const o = parse(argv);
  if (o.command === 'audit') {
    const r = runAudit({ repoRoot: o['repo-root'], mapPath: o.map });
    out.write(o.json ? `${JSON.stringify({ counts: r.counts, findings: r.findings, table: r.table }, null, 2)}\n` : toMarkdown(r));
    return r.counts.error ? 1 : 0;
  }
  const plan = planConsolidation({ repoRoot: o['repo-root'], mapPath: o.map });
  for (const c of plan.changes) out.write(`${o.write ? 'write' : 'would write'} ${c.file}  (${c.notes.join('; ')})\n`);
  out.write(`${plan.changes.length} file(s); ${plan.linkRewrites} link rewrites, ${plan.linesRemoved} duplicate/self list items removed, ${plan.sitemapRemoved} sitemap URLs removed\n`);
  if (o.write) for (const c of plan.changes) writeFileSync(join(o['repo-root'], c.file), c.after);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try { process.exitCode = main(); } catch (e) { process.stderr.write(`seo: ${e.message}\n`); process.exitCode = 2; }
}
