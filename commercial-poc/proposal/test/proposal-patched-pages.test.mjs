// Content rules checked over the FULLY PATCHED pages. The committed diff files are applied to
// copies of the source in a fresh OS temp directory (never the worktree), then read back from disk.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { buildProposal, PROPOSAL_ROOT, REPO_ROOT, sha256 } from '../src/build.mjs';
import { parseUnifiedDiff, applyFilePatch } from '../src/udiff.mjs';
import { diffName } from '../src/report.mjs';

const REQUIRED_DISCLOSURE = 'No-fee pilot placement. WaterWiseKids may offer paid sponsored placements in the future. Sponsorship does not change directory order or editorial content.';
const NY = '/swim-lessons/directory/new-york.html';
const TR = '/swim-lessons-toms-river-nj.html';
const b = buildProposal();
const tmp = mkdtempSync(join(tmpdir(), 'wwk-p2-patched-'));
after(() => rmSync(tmp, { recursive: true, force: true }));

const pages = b.pages.map((p, i) => {
  const source = readFileSync(join(REPO_ROOT, p.source_file), 'utf8');
  const diff = readFileSync(join(PROPOSAL_ROOT, 'diffs', diffName(i, p.page_path)), 'utf8');
  const out = join(tmp, p.source_file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, applyFilePatch(source, parseUnifiedDiff(diff)[0]));
  const patched = readFileSync(out, 'utf8');
  assert.equal(sha256(patched), p.proposed_sha256);
  const outside = patched.split(p.card_html).join('');
  return { p, source, patched, outside };
});
const nonDirectory = pages.filter((x) => x.p.page_path !== NY);
const visibleText = (html) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const n = (hay, re) => (hay.match(re) || []).length;

const SCANS = {
  stars: /[★☆]/g,
  rating_out_of_5: /\b\d(?:\.\d)?\s*\/\s*5\b/g,
  review_count: /\(\s*\d[\d,]*\s+reviews?\s*\)/gi,
  offer: /free\s+(?:trial|consultation|lesson|class)|trial lesson|book your free|book (?:a lesson|lessons) at|learn more\s*&(?:amp;)?\s*book/gi,
  unsupported_claim: /top[- ]rated|proven (?:results|curriculum)|thousands of [a-z ]*families|trusted leader|certified by american red cross/gi,
  featured_block: /featured-school|featured-badge|Featured School/g,
  bss_name: /British Swim School/gi,
  bss_external: /britishswimschool\.com/gi,
  bss_internal_profile: /\/british-swim-school\//gi,
};
const scan = (html) => Object.fromEntries(Object.entries(SCANS).map(([k, re]) => [k, html.match(re) || []]));

test('patched pages: exactly one labeled sponsored-pilot card and one disclosure per page', () => {
  assert.equal(b.config.disclosure, REQUIRED_DISCLOSURE);
  assert.equal(pages.length, 8);
  for (const { p, patched } of pages) {
    assert.equal(n(patched, /data-wwk-sponsored-card=""/g), 1, p.page_path);
    assert.equal(n(patched, /<aside class="wwk-sponsored"/g), 1, p.page_path);
    assert.equal(n(patched, /<p class="wwk-sponsored__label" id="[^"]+">Sponsored pilot<\/p>/g), 1, p.page_path);
    assert.equal(n(visibleText(patched), /Sponsored pilot/g), 1, `${p.page_path}: one visible "Sponsored pilot" label`);
    assert.equal(n(patched, /class="wwk-sponsored__disclosure"/g), 1);
    assert.ok(patched.includes(`<p class="wwk-sponsored__disclosure">${REQUIRED_DISCLOSURE}</p>`), 'exact required disclosure');
    assert.doesNotMatch(visibleText(patched.split(p.card_html).join('')), /sponsor/i, 'no other sponsor wording outside the card');
    assert.doesNotMatch(p.card_html, /\$\s*\d|\bper month\b|\bfee of\b/i, 'no price published');
  }
});

test('patched pages: no .featured-school block remains (the six replacement pages and the other two)', () => {
  const six = pages.filter((x) => x.source.includes('<section class="featured-school">'));
  assert.equal(six.length, 6);
  for (const { p, patched } of pages) {
    assert.equal(n(patched, /featured-school|featured-badge/g), 0, p.page_path);
    assert.equal(n(visibleText(patched), /Featured School/g), 0, p.page_path);
  }
});

test('patched local pages: outside the card there are no stars, ratings, review counts, offers, unsupported claims or BSS mentions/links', () => {
  // Self-check: every scan really fires on the unpatched sources, so a clean result below is meaningful.
  const sourceHits = Object.fromEntries(Object.keys(SCANS).map((k) => [k, nonDirectory.reduce((sum, x) => sum + scan(x.source)[k].length, 0)]));
  for (const [k, v] of Object.entries(sourceHits)) assert.ok(v > 0, `scan ${k} found nothing in the unpatched sources`);
  for (const { p, outside } of nonDirectory) {
    const hits = scan(outside);
    for (const [k, v] of Object.entries(hits)) assert.deepEqual(v, [], `${p.page_path}: ${k} outside the card: ${v.slice(0, 3).join(' | ')}`);
  }
});

test('patched cards carry no stars, ratings, review counts, offers or unsupported claims; sponsor links only inside them', () => {
  for (const { p } of pages) {
    const hits = scan(p.card_html);
    for (const k of ['stars', 'rating_out_of_5', 'review_count', 'offer', 'unsupported_claim', 'featured_block', 'bss_internal_profile']) assert.deepEqual(hits[k], [], `${p.page_path}: ${k}`);
    const hrefs = [...p.card_html.matchAll(/<a ([^>]*)>/g)].map((x) => x[1]);
    assert.ok(hrefs.length >= 2);
    for (const a of hrefs) { assert.match(a, /href="https:\/\/britishswimschool\.com\//); assert.match(a, /rel="sponsored noopener"/); assert.match(a, /utm_medium=sponsored_pilot/); }
  }
});

test('New York: the only BSS links outside the card are the pre-existing organic directory ones, byte-for-byte', () => {
  const { p, source, patched, outside } = pages.find((x) => x.p.page_path === NY);
  assert.ok(patched.split(`${p.card_html}\n`).join('') === source, 'removing the card restores the NY source exactly: nothing else changed');
  assert.deepEqual(scan(outside), scan(source), 'every pre-existing NY match (organic BSS listings, editorial FAQ, review-form stars) is unchanged and none was added');
  const extLinks = (html) => [...html.matchAll(/<a [^>]*href="(https:\/\/britishswimschool\.com[^"]*)"[^>]*>/g)].map((x) => x[0]);
  assert.deepEqual(extLinks(outside), extLinks(source));
  assert.ok(extLinks(source).length >= 3, 'organic Brooklyn, Long Island and Manhattan listings');
  for (const a of extLinks(outside)) { assert.doesNotMatch(a, /sponsored|utm_/, 'organic links stay unsponsored and untagged'); }
});

test('organic directory order and content unchanged; other-option listings unchanged on every page', () => {
  const ny = pages.find((x) => x.p.page_path === NY);
  const order = (html) => [...html.matchAll(/<div class="school-card" id="([^"]+)"/g)].map((x) => x[1]);
  assert.ok(order(ny.source).length >= 30);
  assert.deepEqual(order(ny.patched), order(ny.source));
  const block = (html) => html.slice(html.indexOf('id="schoolsList"'), html.indexOf('<!-- Frequently Asked Questions -->'));
  assert.ok(block(ny.source).length > 10000 && block(ny.patched) === block(ny.source), '#schoolsList block byte-identical');
  const itemList = (html) => html.split('\n').filter((l) => l.includes('"@type":"ItemList"'));
  assert.equal(itemList(ny.source).length, 1);
  assert.ok(itemList(ny.patched)[0] === itemList(ny.source)[0], 'ItemList JSON-LD line byte-identical');
  const listings = (html) => [...html.matchAll(/<div class="school-listing">[\s\S]*?<\/div>\s*<\/div>/g)].map((x) => x[0]);
  for (const { p, source, patched } of pages) assert.deepEqual(listings(patched), listings(source), `${p.page_path}: other-option listings unchanged`);
});

test('editorial internal navigation is preserved; only /british-swim-school/ promo links are removed', () => {
  const internal = (html) => new Set([...html.matchAll(/href="(\/[^"]*)"/g)].map((x) => x[1]));
  for (const { p, source, patched } of pages) {
    const before = internal(source); const now = internal(patched);
    for (const h of before) if (!h.startsWith('/british-swim-school/')) assert.ok(now.has(h), `${p.page_path}: internal link ${h} lost`);
    // The only new internal links allowed: the component assets and the site's existing neutral "Find Classes Near You" target.
    for (const h of now) assert.ok(before.has(h) || h.startsWith('/assets/css/wwk-sponsored.css') || h === b.config.neutral_cta_href, `${p.page_path}: new internal link ${h}`);
  }
  const tr = pages.find((x) => x.p.page_path === TR);
  assert.equal(n(tr.patched, /href="\/swim-lessons-jersey-shore\.html">Jersey Shore lesson pages<\/a>/g), 2, 'Toms River keeps both internal Jersey Shore links');
  assert.equal(n(tr.patched, /School website/g), 0, 'Toms River "School website" sidebar card removed');
  assert.equal(n(tr.patched, /Visit Jersey Shore|Toms River location<\/a>/g), 0, 'Toms River unlabeled BSS buttons removed');
  assert.ok(tr.patched.includes(`<div class="hero-actions"><a class="button" href="/swim-lessons-jersey-shore.html">Jersey Shore lesson pages</a></div>\n</div>\n${tr.p.card_html}\n<a class="back-link" href="/find-swim-lessons.html">← Back</a>`), 'Toms River card sits right after the Next step box and right before the Back link');
});

test('structured data still parses on every patched page, and Cheltenham FAQ JSON-LD matches the visible FAQ', () => {
  const blocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((x) => x[1]);
  for (const { p, source, patched } of pages) {
    assert.equal(blocks(patched).length, blocks(source).length, p.page_path);
    for (const j of blocks(patched)) assert.doesNotThrow(() => JSON.parse(j), p.page_path);
  }
  const ch = pages.find((x) => x.p.page_path === '/swim-lessons/cheltenham-pa.html');
  const faq = blocks(ch.patched).map((j) => JSON.parse(j)).find((j) => j['@type'] === 'FAQPage');
  const ld = faq.mainEntity.map((q) => q.acceptedAnswer.text);
  const visible = [...ch.patched.matchAll(/<div class="faq-answer">\s*<p>([\s\S]*?)<\/p>/g)].map((x) => x[1].replace(/&amp;/g, '&'));
  assert.deepEqual(ld, visible);
  for (const t of ld) assert.doesNotMatch(t, /British Swim School|free consultation|\$\d|Top-rated/i);
});

test('audit records every changed promotional item with a classification, and RB-1..RB-3 are resolved', async () => {
  const { RELEASE_BLOCKERS, PHASE3_PREREQUISITES } = await import('../src/dispositions.mjs');
  for (const id of ['RB-1', 'RB-2', 'RB-3']) assert.match(RELEASE_BLOCKERS.find((r) => r.id === id).status, /^resolved by proposal/);
  assert.equal(RELEASE_BLOCKERS.some((r) => r.id === 'RB-4'), false, 'collector item moved to Phase 3 prerequisites');
  assert.deepEqual(PHASE3_PREREQUISITES.map((x) => x.item).slice(0, 3), ['Collector endpoint', 'Real campaign dates', 'Cross-browser and device QA']);
  for (const { p } of pages) {
    for (const e of p.audit.edits) assert.ok(['promotional', 'sponsored'].includes(e.classification) && e.finding && e.action, `${p.page_path} ${e.id}`);
    for (const k of p.audit.kept) assert.ok(['editorial', 'editorial_navigation', 'organic_directory'].includes(k.classification), `${p.page_path} ${k.id}`);
    assert.equal(p.audit.edits.filter((e) => e.classification === 'sponsored' || e.with_card).length, 1, 'exactly one card edit');
  }
});
