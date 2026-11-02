#!/usr/bin/env node
import { readdirSync, readFileSync, lstatSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { STAGING_ROOT } from './lib/paths.mjs';

const excluded = new Set(['node_modules', '.data', '.wrangler', 'evidence']);
function* walk(dir = STAGING_ROOT) {
  for (const name of readdirSync(dir).sort()) {
    if (excluded.has(name)) continue;
    const path = join(dir, name);
    const stat = lstatSync(path);
    if (stat.isDirectory()) yield* walk(path);
    else if (stat.isFile()) yield path;
  }
}

const files = [...walk()];
const findings = [];
for (const file of files.filter((path) => path.endsWith('.mjs'))) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) findings.push({ file: relative(STAGING_ROOT, file), rule: 'node_check', detail: (result.stderr || result.stdout).trim() });
}

const textFiles = files.filter((path) => /\.(mjs|jsonc?|md|sql|example)$/.test(path));
const secretRules = [
  ['private_key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['openai_key', /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ['aws_key', /\bAKIA[0-9A-Z]{16}\b/],
  ['cloudflare_token', /\b(?:CLOUDFLARE|CF)_API_(?:TOKEN|KEY)\s*=\s*(?!REPLACE)[^\s#]+/],
];
for (const file of textFiles) {
  const text = readFileSync(file, 'utf8');
  for (const [rule, pattern] of secretRules) if (pattern.test(text)) findings.push({ file: relative(STAGING_ROOT, file), rule });
  if (!file.includes('/test/') && /[A-Za-z0-9._%+-]+@(?![^\s'"<>]*\.test\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(text)) {
    findings.push({ file: relative(STAGING_ROOT, file), rule: 'committed_email' });
  }
}

for (const worker of ['collector', 'portal']) {
  const config = readFileSync(join(STAGING_ROOT, worker, 'wrangler.jsonc'), 'utf8');
  if (/"remote"\s*:\s*true/.test(config)) findings.push({ file: `${worker}/wrangler.jsonc`, rule: 'remote_binding' });
  if (!new RegExp(`"main"\\s*:\\s*"\.\./src/${worker}/entry\\.mjs"`).test(config)) findings.push({ file: `${worker}/wrangler.jsonc`, rule: 'entrypoint_shape' });
}

const result = { ok: findings.length === 0, files_scanned: files.length, modules_checked: files.filter((path) => path.endsWith('.mjs')).length, findings };
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
