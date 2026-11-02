#!/usr/bin/env node
// Zero-dependency static checks: syntax (node --check), lint rules, secret scan and
// personal-data scan over everything in commercial-poc/ (excluding .data/ and evidence/ images).
// Exit non-zero on any finding.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { POC_ROOT } from '../src/config.mjs';

const SKIP_DIRS = new Set(['.data', 'node_modules']);
const TEXT_EXT = new Set(['.mjs', '.js', '.cjs', '.json', '.md', '.sql', '.css', '.html', '.txt', '']);
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) { if (!SKIP_DIRS.has(name)) yield* walk(full); } else yield full;
  }
}
const files = [...walk(POC_ROOT)].filter((f) => TEXT_EXT.has(extname(f)));
const findings = [];
const add = (file, rule, detail) => findings.push({ file: relative(POC_ROOT, file), rule, detail });

// 1. Syntax.
let checked = 0;
for (const f of files.filter((x) => x.endsWith('.mjs'))) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  checked += 1;
  if (r.status !== 0) add(f, 'syntax', r.stderr.split('\n').slice(0, 3).join(' '));
}

// 2. Lint rules for runtime code.
const LINT = [
  ['no-eval', /\beval\s*\(|new Function\s*\(/],
  ['no-innerHTML', /\.innerHTML\b|document\.write\s*\(/],
  ['no-console-log-in-src', /console\.log\(/, (f) => relative(POC_ROOT, f).startsWith('src/')],
  ['no-todo', /\b(TODO|FIXME|XXX)\b/],
  ['no-wildcard-bind', /0\.0\.0\.0['"`]\s*[,)]/, (f) => !relative(POC_ROOT, f).startsWith('test/')],
  ['no-sql-string-concat', /prepare\(\s*['"`][^'"`]*['"`]\s*\+/],
  ['no-network-fetch-in-src', /\bfetch\s*\(/, (f) => relative(POC_ROOT, f).startsWith('src/')],
];
for (const f of files.filter((x) => x.endsWith('.mjs') && !x.endsWith('static-checks.mjs'))) {
  const text = readFileSync(f, 'utf8');
  for (const [rule, re, when] of LINT) if ((!when || when(f)) && re.test(text)) add(f, rule, re.toString());
}

// 3. Secret scan (all text files).
const SECRETS = [
  ['aws-key', /AKIA[0-9A-Z]{16}/], ['private-key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/], ['openai-anthropic-key', /\bsk-(ant-)?[A-Za-z0-9_-]{20,}/],
  ['slack-token', /xox[baprs]-[A-Za-z0-9-]{10,}/], ['github-token', /\bgh[pousr]_[A-Za-z0-9]{30,}/], ['google-api-key', /AIza[0-9A-Za-z_-]{35}/],
  ['assigned-secret', /(password|passwd|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"\s]{8,}['"]/i],
];
// 4. Personal-data scan: real-looking emails and phone numbers outside tests (tests use reserved example data).
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE = /\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g;
const SAFE_EMAIL_DOMAINS = /@(example\.(com|org|net)|b\.co|[a-z0-9.-]*\.invalid)$/i;
const SAFE_PHONE = /555[\s.-]01\d\d/;
for (const f of files) {
  const rel = relative(POC_ROOT, f);
  if (rel.endsWith('static-checks.mjs')) continue;
  const text = readFileSync(f, 'utf8');
  for (const [rule, re] of SECRETS) if (re.test(text)) add(f, `secret:${rule}`, 'pattern matched');
  for (const m of text.matchAll(EMAIL)) if (!SAFE_EMAIL_DOMAINS.test(m[0])) add(f, 'pii:email', m[0].replace(/^(.).*@/, '$1***@'));
  for (const m of text.matchAll(PHONE)) if (!SAFE_PHONE.test(m[0]) && !rel.startsWith('evidence/')) add(f, 'pii:phone', `${m[0].slice(0, 3)}…`);
}

const summary = { files_scanned: files.length, mjs_syntax_checked: checked, findings };
console.log(JSON.stringify(summary, null, 2));
process.exitCode = findings.length ? 1 : 0;
