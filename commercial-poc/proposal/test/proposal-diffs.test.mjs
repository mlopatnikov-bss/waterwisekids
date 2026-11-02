// Diffs: generated, checked, never applied. Public source untouched.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { buildProposal, planEdits, PROPOSAL_ROOT, REPO_ROOT, sha256 } from '../src/build.mjs';
import { parseUnifiedDiff, applyFilePatch, reverseFilePatch } from '../src/udiff.mjs';
import { treeFingerprint, walkPublic } from '../src/snapshot.mjs';
import { diffName } from '../src/report.mjs';

const b = buildProposal();
const snapshot = JSON.parse(readFileSync(join(PROPOSAL_ROOT, 'source-snapshot.json'), 'utf8'));
const diffFile = (i) => readFileSync(join(PROPOSAL_ROOT, 'diffs', diffName(i, b.pages[i].page_path)), 'utf8');
const assetsDiff = readFileSync(join(PROPOSAL_ROOT, 'diffs/00-new-assets.diff'), 'utf8');

test('no public source file changed: full-tree fingerprint, target pages and new-asset paths match the recorded snapshot', () => {
  const now = treeFingerprint(REPO_ROOT);
  assert.equal(now.file_count, snapshot.file_count);
  assert.equal(now.aggregate_sha256, snapshot.aggregate_sha256);
  for (const [file, sha] of Object.entries(snapshot.target_pages)) assert.equal(sha256(readFileSync(join(REPO_ROOT, file))), sha, file);
  for (const p of snapshot.absent_asset_paths) assert.equal(existsSync(join(REPO_ROOT, p)), false, p);
});

test('the proposal is not applied anywhere in the public tree', () => {
  for (const rel of walkPublic(REPO_ROOT)) {
    if (!/\.(html|js|css)$/.test(rel)) continue;
    const text = readFileSync(join(REPO_ROOT, rel), 'utf8');
    assert.equal(text.includes('wwk-sponsored') || text.includes('data-wwk-sponsored-card'), false, rel);
  }
});

test('committed diff files equal a fresh in-memory build (no stale or hand-edited diffs)', () => {
  b.pages.forEach((p, i) => assert.equal(diffFile(i), p.diff, p.page_path));
  assert.equal(assetsDiff, b.assets.map((a) => a.diff).join(''));
  const listed = readdirSync(join(PROPOSAL_ROOT, 'diffs')).sort();
  assert.deepEqual(listed, ['00-new-assets.diff', ...b.pages.map((p, i) => diffName(i, p.page_path))].sort());
});

test('each page diff applies strictly IN MEMORY, reverses to the exact source, and changes only audited lines', () => {
  const inv = JSON.parse(readFileSync(join(PROPOSAL_ROOT, 'inventory.json'), 'utf8'));
  b.pages.forEach((p, i) => {
    const files = parseUnifiedDiff(diffFile(i));
    assert.equal(files.length, 1);
    assert.equal(files[0].oldPath, `a/${p.source_file}`); assert.equal(files[0].newPath, `b/${p.source_file}`);
    const source = readFileSync(join(REPO_ROOT, p.source_file), 'utf8');
    const out = applyFilePatch(source, files[0]);
    assert.equal(sha256(out), inv.pages[i].proposed_sha256, p.page_path);
    assert.equal(applyFilePatch(out, reverseFilePatch(files[0])), source, 'reverse patch restores the source byte-for-byte');
    // Every removed/changed source line lies inside an audited edit; nothing else is touched.
    const touched = [];
    for (const h of files[0].hunks) {
      let old = h.oldLen === 0 ? h.oldStart + 1 : h.oldStart;
      for (const l of h.lines) { if (l.tag === '-') touched.push(old); if (l.tag !== '+') old += 1; }
    }
    const ranges = p.audit.edits.map((e) => e.source_lines);
    for (const n of touched) assert.ok(ranges.some(([a, z]) => n >= a && n <= z), `${p.page_path}: source line ${n} changed outside the audited edit plan`);
    // Card block appears exactly once, exactly as reviewed.
    assert.equal(out.split(p.card_html).length, 2, 'card block appears exactly once');
    assert.equal(out.split('\n').slice(p.card_position.proposed_start_line - 1, p.card_position.proposed_start_line - 1 + p.card_position.card_lines).join('\n'), p.card_html);
    // Strict: a drifted line at the card position is refused.
    const driftAt = (p.card_position.source_from_line ?? p.card_position.anchor_line) - 1;
    const drifted = source.split('\n'); drifted[driftAt] += ' ';
    assert.throws(() => applyFilePatch(drifted.join('\n'), files[0]), /context mismatch/, 'strict: a drifted line is refused');
  });
});

test('six Featured School pages: the card REPLACES the whole old block in place (not inserted above it)', () => {
  const six = b.pages.filter((p) => !['/swim-lessons-toms-river-nj.html', '/swim-lessons/directory/new-york.html'].includes(p.page_path));
  assert.equal(six.length, 6);
  for (const p of six) {
    const c = p.card_position;
    assert.equal(c.op, 'replace_block', p.page_path);
    const source = readFileSync(join(REPO_ROOT, p.source_file), 'utf8').split('\n');
    const removed = source.slice(c.source_from_line - 1, c.source_to_line);
    assert.ok(removed.some((l) => l.includes('<section class="featured-school">')), 'removed range starts the Featured School section');
    assert.equal(removed[removed.length - 1].trim(), '</section>', 'removed range ends with its closing tag');
    assert.equal(removed.filter((l) => l.includes('<section')).length, 1, 'exactly one section removed');
    assert.ok(removed.join('\n').includes('★★★★★') && /\d\.\d\/5 \(\d+ reviews\)/.test(removed.join('\n')), 'stars and rating/review count are inside the removed range');
  }
});

test('the build refuses drifted, duplicated or missing expected source text', () => {
  const p = b.config.pages.find((x) => x.page_path === '/swim-lessons/howell-nj.html');
  const src = readFileSync(join(REPO_ROOT, 'swim-lessons/howell-nj.html'), 'utf8').split('\n');
  const card = ['<aside>x</aside>'];
  assert.doesNotThrow(() => planEdits(src, p, card));
  const shortBlock = src.filter((l) => l !== '                <li>Ages 6 months through adults</li>');
  assert.throws(() => planEdits(shortBlock, p, card), /block is 16 lines, expected 17/);
  const dup = [...src]; dup.splice(10, 0, p.edits[0].from_line);
  assert.throws(() => planEdits(dup, p, card), /must match exactly one source line, matched 2/);
  const edited = src.map((l) => l.replace('Schedule your free consultation and trial lesson.', 'Schedule a visit.'));
  assert.throws(() => planEdits(edited, p, card), /must match exactly one source line, matched 0|to_line not found/);
  const t = b.config.pages.find((x) => x.page_path === '/swim-lessons-toms-river-nj.html');
  const tsrc = readFileSync(join(REPO_ROOT, 'swim-lessons-toms-river-nj.html'), 'utf8').split('\n').map((l) => l.replace('Families in the area can explore British Swim School', 'Families can explore British Swim School'));
  assert.throws(() => planEdits(tsrc, t, card), /find text must occur exactly once/);
});

test('New York directory: card sits outside #schoolsList and the organic listing order is unchanged', () => {
  const i = b.pages.findIndex((p) => p.page_path === '/swim-lessons/directory/new-york.html');
  const p = b.pages[i];
  const source = readFileSync(join(REPO_ROOT, p.source_file), 'utf8');
  const out = applyFilePatch(source, parseUnifiedDiff(diffFile(i))[0]);
  const order = (html) => [...html.matchAll(/<div class="school-card" id="([^"]+)"/g)].map((x) => x[1]);
  assert.ok(order(source).length >= 30);
  assert.deepEqual(order(out), order(source));
  const cardAt = out.indexOf('data-wwk-sponsored-card');
  assert.ok(cardAt > out.indexOf('id="cities"') && cardAt < out.indexOf('id="schoolsList"'));
  const listBlock = out.slice(out.indexOf('id="schoolsList"'), out.indexOf('<!-- Frequently Asked Questions -->'));
  assert.equal(listBlock.includes('wwk-sponsored'), false);
  assert.equal(out.indexOf('inclusion is not a ranking') < cardAt, true, 'card follows the "not a ranking" disclaimer');
});

test('new-asset diff creates exactly the two component files and nothing else', () => {
  const files = parseUnifiedDiff(assetsDiff);
  assert.deepEqual(files.map((f) => [f.oldPath, f.newPath, f.isNew]), [['/dev/null', 'b/assets/css/wwk-sponsored.css', true], ['/dev/null', 'b/assets/js/wwk-sponsored.js', true]]);
  assert.equal(applyFilePatch(null, files[0]), readFileSync(join(PROPOSAL_ROOT, 'component/wwk-sponsored.css'), 'utf8'));
  assert.equal(applyFilePatch(null, files[1]), readFileSync(join(PROPOSAL_ROOT, 'component/wwk-sponsored.js'), 'utf8'));
});

function tempCopy() {
  const dir = mkdtempSync(join(tmpdir(), 'wwk-p2-check-'));
  for (const p of b.pages) { mkdirSync(join(dir, dirname(p.source_file)), { recursive: true }); writeFileSync(join(dir, p.source_file), readFileSync(join(REPO_ROOT, p.source_file))); }
  return dir;
}
const has = (bin) => spawnSync(bin, ['--version'], { encoding: 'utf8' }).status === 0;

test('GNU patch: --dry-run accepts every diff, and apply + reverse round-trips, on a temporary copy only', { skip: has('patch') ? false : 'patch not installed' }, () => {
  const dir = tempCopy();
  try {
    for (const f of ['00-new-assets.diff', ...b.pages.map((p, i) => diffName(i, p.page_path))]) {
      const r = spawnSync('patch', ['--dry-run', '--batch', '--forward', '-p1', '-i', join(PROPOSAL_ROOT, 'diffs', f)], { cwd: dir, encoding: 'utf8' });
      assert.equal(r.status, 0, `${f}: ${r.stdout}${r.stderr}`);
      assert.doesNotMatch(r.stdout, /offset|fuzz/i, `${f} applied with offset/fuzz`);
    }
    for (const p of b.pages) assert.equal(sha256(readFileSync(join(dir, p.source_file))), p.source_sha256, 'dry run changed nothing');
    // Apply for real INSIDE THE TEMP COPY, check the result, then reverse it back to the exact source.
    b.pages.forEach((p, i) => {
      const f = join(PROPOSAL_ROOT, 'diffs', diffName(i, p.page_path));
      const fwd = spawnSync('patch', ['--batch', '--forward', '--no-backup-if-mismatch', '-p1', '-i', f], { cwd: dir, encoding: 'utf8' });
      assert.equal(fwd.status, 0, `${p.page_path}: ${fwd.stdout}${fwd.stderr}`);
      assert.equal(sha256(readFileSync(join(dir, p.source_file))), p.proposed_sha256, 'temp copy now equals the proposed page');
      const rev = spawnSync('patch', ['--batch', '-R', '--no-backup-if-mismatch', '-p1', '-i', f], { cwd: dir, encoding: 'utf8' });
      assert.equal(rev.status, 0, `${p.page_path} reverse: ${rev.stdout}${rev.stderr}`);
      assert.equal(sha256(readFileSync(join(dir, p.source_file))), p.source_sha256, 'reverse restores the source');
      assert.doesNotMatch(fwd.stdout + rev.stdout, /offset|fuzz/i);
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('git apply: --check accepts every diff, and apply + -R round-trips, on a temporary copy only', { skip: has('git') ? false : 'git not installed' }, () => {
  const dir = tempCopy();
  try {
    for (const f of ['00-new-assets.diff', ...b.pages.map((p, i) => diffName(i, p.page_path))]) {
      const r = spawnSync('git', ['apply', '--check', '--verbose', join(PROPOSAL_ROOT, 'diffs', f)], { cwd: dir, encoding: 'utf8', env: { ...process.env, GIT_DIR: join(dir, '.no-git'), GIT_CEILING_DIRECTORIES: dir } });
      assert.equal(r.status, 0, `${f}: ${r.stdout}${r.stderr}`);
    }
    for (const p of b.pages) assert.equal(sha256(readFileSync(join(dir, p.source_file))), p.source_sha256);
    assert.equal(existsSync(join(dir, 'assets/js/wwk-sponsored.js')), false);
    const env = { ...process.env, GIT_DIR: join(dir, '.no-git'), GIT_CEILING_DIRECTORIES: dir };
    b.pages.forEach((p, i) => {
      const f = join(PROPOSAL_ROOT, 'diffs', diffName(i, p.page_path));
      assert.equal(spawnSync('git', ['apply', f], { cwd: dir, encoding: 'utf8', env }).status, 0, `${p.page_path} apply in temp copy`);
      assert.equal(sha256(readFileSync(join(dir, p.source_file))), p.proposed_sha256);
      const r = spawnSync('git', ['apply', '--check', '-R', f], { cwd: dir, encoding: 'utf8', env });
      assert.equal(r.status, 0, `${p.page_path} reverse check: ${r.stderr}`);
      assert.equal(spawnSync('git', ['apply', '-R', f], { cwd: dir, encoding: 'utf8', env }).status, 0);
      assert.equal(sha256(readFileSync(join(dir, p.source_file))), p.source_sha256, 'git apply -R restores the source');
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
