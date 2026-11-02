// Synthetic, deterministic tests for the BSS Messenger instant-stream adapter.
// No live event file is read. Every name, email, phone and message id below is a
// fabricated sentinel; the tests assert none of them ever leaves the adapter or CLI.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildConversionFeed, leadBasis, BASES, TYPES } from '../src/conversion-feed.mjs';
import { planImport } from '../src/conversion-import.mjs';
import { ONBOARDING_ROOT } from '../src/repo.mjs';
import { run } from '../cli.mjs';
import { clone, loadPilot, PILOT_PATH } from './support.mjs';

const MAP = JSON.parse(readFileSync(join(ONBOARDING_ROOT, 'examples/location-map.example.json'), 'utf8')); // synthetic codes only
const at = (d, h = 15) => Date.parse(`${d}T${String(h).padStart(2, '0')}:00:00.000Z`);
const PII = {
  names: ['Zelda Quixote', 'Quixote Family', 'Ozymandias Vale', 'Vale Family', 'Penelope Ibex'],
  emails: ['zelda.q@example.com', 'oz.vale@example.com', 'pen.ibex@example.com', 'late.lead@example.com', 'recent@example.com', 'early@example.com', 'old@example.com'],
  phones: ['7325550142', '(732) 555-0142', '2155550199'],
};
const lead = (id, o) => ({ kind: 'lead', messageId: `msg-lead-${id}-sentinel`, receivedAt: o.ts, name: 'Zelda Quixote', classCode: 'TURTLE', utmCampaign: null, utmContent: null, matched: [], ...o });
const reg = (id, o) => ({ kind: 'registration', messageId: `msg-reg-${id}-sentinel`, receivedAt: o.ts, family: 'Quixote Family', students: ['Ozymandias Vale'], matched: [], ...o });

function streams() {
  const pa = { events: [
    // Cheltenham: UTM-matched lead (sponsored_pilot), then a registration with the same email in a different case.
    lead('chel', { ts: at('2026-11-03'), email: 'zelda.q@example.com', phone: '2155550199', loc: 'EXAMPLE-CHEL', pool: 'LA Fitness Cheltenham', heard: 'Google', utmSource: 'waterwisekids', utmMedium: 'sponsored_pilot' }),
    lead('chel', { ts: at('2026-11-03'), email: 'zelda.q@example.com', loc: 'EXAMPLE-CHEL', utmSource: 'waterwisekids', utmMedium: 'sponsored_pilot' }), // duplicate messageId
    reg('chel', { ts: at('2026-11-10'), emails: ['ZELDA.Q@example.com'], phones: [], pools: ['LA Fitness Cheltenham'] }),
    { kind: 'reply', messageId: 'msg-reply-sentinel', ts: at('2026-11-04') },
    lead('nomid', { messageId: null, ts: at('2026-11-04'), email: 'pen.ibex@example.com', heard: 'WaterWiseKids', pool: 'LA Fitness Cheltenham' }),
  ] };
  const nj = { events: [
    // Howell lead with BOTH signals (sponsored UTM + heard=WaterWiseKids): UTM wins; registers later at Toms River by phone.
    lead('how', { ts: at('2026-11-04'), email: 'oz.vale@example.com', phone: '(732) 555-0142', loc: null, pool: 'LA Fitness Howell', heard: 'WaterWiseKids', utmSource: 'WaterWiseKids', utmMedium: 'Sponsored_Pilot' }),
    reg('tr', { ts: at('2026-11-12'), emails: [], phones: ['7325550142'], pools: ['Toms River'] }),
    reg('tr-repeat', { ts: at('2026-11-12', 18), emails: [], phones: ['7325550142'], pools: ['Toms River'] }), // same lead, location, day
    reg('ambig', { ts: at('2026-11-13'), emails: ['oz.vale@example.com'], phones: [], pools: ['LA Fitness Brick', 'LA Fitness Howell'] }),
    lead('other-medium', { ts: at('2026-11-05'), email: 'x1@example.com', pool: 'LA Fitness Brick', heard: 'Google', utmSource: 'waterwisekids', utmMedium: 'referral' }),
    lead('fb', { ts: at('2026-11-05'), email: 'x2@example.com', pool: 'LA Fitness Brick', heard: 'Facebook', utmSource: null, utmMedium: null }),
    // Unmapped (closed) pool: no lead row, but still attributes a later Brick enrollment.
    lead('closed', { ts: at('2026-11-05'), email: 'pen.ibex@example.com', loc: 'EXAMPLE-OLD', pool: 'Asbury Park (closed)', heard: 'waterwisekids.com' }),
    reg('brick', { ts: at('2026-11-11'), emails: ['pen.ibex@example.com'], phones: [], pools: ['LA Fitness Brick'] }),
    // Lead before the campaign (outside the period) still attributes an in-period enrollment (39 days later).
    lead('early', { ts: at('2026-10-01'), email: 'early@example.com', pool: 'LA Fitness Howell', heard: 'WaterWiseKids' }),
    reg('early', { ts: at('2026-11-09'), emails: ['early@example.com'], phones: [], pools: ['LA Fitness Howell'] }),
    // Lead older than 90 days does not attribute.
    lead('old', { ts: at('2026-07-01'), email: 'old@example.com', pool: 'LA Fitness Howell', heard: 'WaterWiseKids' }),
    reg('old', { ts: at('2026-11-09'), emails: ['old@example.com'], phones: [], pools: ['LA Fitness Howell'] }),
    // Most recent prior lead wins: UTM lead Nov 2, self-reported-only lead Nov 6, registration Nov 7 -> self only.
    lead('recent-a', { ts: at('2026-11-02'), email: 'recent@example.com', pool: 'LA Fitness Brick', heard: 'Google', utmSource: 'waterwisekids', utmMedium: 'sponsored_pilot' }),
    lead('recent-b', { ts: at('2026-11-06'), email: 'recent@example.com', pool: 'LA Fitness Brick', heard: 'WaterWiseKids' }),
    reg('recent', { ts: at('2026-11-07'), emails: ['recent@example.com'], phones: [], pools: ['LA Fitness Brick'] }),
    // Registration before the only matching lead: not attributed.
    reg('before', { ts: at('2026-11-03'), emails: ['late.lead@example.com'], phones: [], pools: ['LA Fitness Howell'] }),
    lead('late', { ts: at('2026-11-05'), email: 'late.lead@example.com', pool: 'LA Fitness Howell', heard: 'WaterWiseKids' }),
    reg('nomatch', { ts: at('2026-11-08'), emails: ['nobody@example.com'], phones: [], pools: ['LA Fitness Howell'] }),
    { kind: 'lead', messageId: 'msg-bad-ts-sentinel', ts: 'not a date', heard: 'WaterWiseKids' },
  ] };
  return [pa, nj];
}
const OPTS = { to: '2026-11-15', exportedOn: '2026-11-16', granularity: 'week' };
const feed = (s = streams(), o = OPTS) => buildConversionFeed(loadPilot(), s, MAP, o);
const count = (ex, date, ref, type, basis) => ex.rows.find((r) => r.date === date && r.location_ref === ref && r.conversion_type === type && r.attribution_basis === basis)?.count;

test('attribution: authoritative UTM (waterwisekids + sponsored_pilot) wins; heard=WaterWiseKids only when that UTM is absent', () => {
  const f = feed();
  assert.equal(f.ok, true, JSON.stringify(f.errors));
  const js = f.exports['jersey-shore']; const nwp = f.exports['northwest-philadelphia'];
  assert.equal(count(nwp, '2026-11-08', 'EXAMPLE-CHEL', 'qualified_lead', 'utm_matched_in_sponsor_system'), 1);
  assert.equal(count(nwp, '2026-11-08', 'EXAMPLE-CHEL', 'qualified_lead', 'self_reported_wwk_mention'), 0, 'heard=Google is not self-reported');
  // Howell lead has both signals: counted ONCE, under UTM only.
  assert.equal(count(js, '2026-11-08', 'EXAMPLE-HOW', 'qualified_lead', 'utm_matched_in_sponsor_system'), 1);
  assert.equal(count(js, '2026-11-08', 'EXAMPLE-HOW', 'qualified_lead', 'self_reported_wwk_mention'), 1, 'only the late lead (self); the both-signals lead is not repeated here');
  assert.equal(f.warnings.lead_both_signals_utm_wins, 1);
  // waterwisekids with medium=referral and heard=Facebook are not attributed.
  assert.equal(count(js, '2026-11-08', 'EXAMPLE-BRK', 'qualified_lead', 'utm_matched_in_sponsor_system'), 1, 'only recent-a');
  assert.equal(count(js, '2026-11-08', 'EXAMPLE-BRK', 'qualified_lead', 'self_reported_wwk_mention'), 1, 'only recent-b');
  assert.equal(f.warnings.lead_waterwisekids_other_medium, 1);
  assert.equal(f.warnings.lead_not_wwk, 2, 'heard=Facebook, and waterwisekids+referral with heard=Google');
});

test('enrollment: email/phone match to the most recent prior attributed lead within 90 days, inheriting its single basis', () => {
  const f = feed(); const js = f.exports['jersey-shore']; const nwp = f.exports['northwest-philadelphia'];
  assert.equal(count(nwp, '2026-11-15', 'EXAMPLE-CHEL', 'enrollment', 'utm_matched_in_sponsor_system'), 1, 'case-insensitive email match');
  assert.equal(count(js, '2026-11-15', 'EXAMPLE-TR', 'enrollment', 'utm_matched_in_sponsor_system'), 1, 'phone match; location comes from the registration');
  assert.equal(count(js, '2026-11-15', 'EXAMPLE-TR', 'enrollment', 'self_reported_wwk_mention'), 0, 'inherits the single UTM basis of the both-signals lead');
  assert.equal(count(js, '2026-11-15', 'EXAMPLE-BRK', 'enrollment', 'self_reported_wwk_mention'), 1, 'lead with unmapped pool still attributes');
  assert.equal(count(js, '2026-11-15', 'EXAMPLE-HOW', 'enrollment', 'self_reported_wwk_mention'), 1, 'pre-campaign lead within 90 days');
  assert.equal(count(js, '2026-11-08', 'EXAMPLE-BRK', 'enrollment', 'self_reported_wwk_mention'), 1, 'most recent lead (self only) wins');
  assert.equal(count(js, '2026-11-08', 'EXAMPLE-BRK', 'enrollment', 'utm_matched_in_sponsor_system'), 0, 'older UTM lead does not also count');
  const w = f.warnings;
  assert.equal(w.registration_same_day_repeat, 1);
  assert.equal(w.registration_location_ambiguous, 1);
  assert.equal(w.registration_match_outside_window, 2, '>90 days, and registration before its lead');
  assert.equal(w.registration_not_attributed, 1);
  assert.equal(w.lead_duplicate_message_id, 1);
  assert.equal(w.lead_missing_message_id, 1);
  assert.equal(w.lead_invalid_timestamp, 1);
  assert.equal(w.lead_location_unmapped, 1);
  assert.equal(w.qualified_lead_outside_period, 2, 'Oct 1 and Jul 1 leads');
  assert.equal(w.skipped_other_kind, 1);
});

test('leadBasis: exactly one mutually exclusive basis per lead', () => {
  const w = {}; const warn = (k) => { w[k] = (w[k] || 0) + 1; };
  assert.equal(leadBasis({ utmSource: 'waterwisekids', utmMedium: 'sponsored_pilot', heard: 'WaterWiseKids' }, warn), 'utm_matched_in_sponsor_system');
  assert.equal(leadBasis({ utmSource: 'WATERWISEKIDS', utmMedium: 'Sponsored_Pilot', heard: 'Google' }, warn), 'utm_matched_in_sponsor_system');
  assert.equal(leadBasis({ utmSource: 'waterwisekids', utmMedium: 'referral', heard: 'WaterWiseKids' }, warn), 'self_reported_wwk_mention', 'other medium is not authoritative');
  assert.equal(leadBasis({ utmSource: 'waterwisekids', utmMedium: 'referral', heard: 'Google' }, warn), null);
  assert.equal(leadBasis({ utmSource: 'google', utmMedium: 'sponsored_pilot', heard: 'waterwisekids.com' }, warn), 'self_reported_wwk_mention');
  assert.equal(leadBasis({ heard: 'Facebook' }, warn), null);
  assert.deepEqual(w, { lead_both_signals_utm_wins: 1, lead_waterwisekids_other_medium: 2 });
});

test('invariant: summing rows across attribution_basis counts every lead and enrollment exactly once', () => {
  for (const granularity of ['week', 'day']) {
    const f = feed(streams(), { ...OPTS, granularity });
    const sum = (tk, type) => f.exports[tk].rows.filter((r) => r.conversion_type === type).reduce((n, r) => n + r.count, 0);
    // In-period, mapped, attributed leads: NWP chel; JS how (UTM, both signals), late, recent-a, recent-b.
    assert.equal(sum('northwest-philadelphia', 'qualified_lead'), 1, granularity);
    assert.equal(sum('jersey-shore', 'qualified_lead'), 4, granularity);
    // Enrollments: NWP chel; JS tr (inherits UTM), brick, early, recent.
    assert.equal(sum('northwest-philadelphia', 'enrollment'), 1, granularity);
    assert.equal(sum('jersey-shore', 'enrollment'), 4, granularity);
    // Every (date, location, type) cell is split across exactly the two bases, never more.
    for (const ex of Object.values(f.exports)) {
      const cells = new Map();
      for (const r of ex.rows) { const k = `${r.date}|${r.location_ref}|${r.conversion_type}`; cells.set(k, [...(cells.get(k) || []), r.attribution_basis]); }
      for (const bases of cells.values()) assert.deepEqual([...bases].sort(), [...BASES].sort());
      assert.deepEqual([...new Set(ex.rows.map((r) => r.conversion_type))].sort(), [...TYPES].sort());
    }
  }
  assert.deepEqual(feed().totals['jersey-shore'], {
    utm_matched_in_sponsor_system: { qualified_lead: 2, enrollment: 1 },
    self_reported_wwk_mention: { qualified_lead: 2, enrollment: 3 },
  });
});

test('explicit zero rows for every active location x week x type x basis; per-tenant isolation', () => {
  const f = feed(); const js = f.exports['jersey-shore']; const nwp = f.exports['northwest-philadelphia'];
  assert.equal(js.rows.length, 2 * 3 * 2 * 2);
  assert.equal(nwp.rows.length, 2 * 1 * 2 * 2);
  assert.equal(count(js, '2026-11-08', 'EXAMPLE-TR', 'qualified_lead', 'utm_matched_in_sponsor_system'), 0, 'live zero is a row, not missing');
  assert.ok(js.rows.every((r) => ['EXAMPLE-HOW', 'EXAMPLE-BRK', 'EXAMPLE-TR'].includes(r.location_ref)));
  assert.ok(nwp.rows.every((r) => r.location_ref === 'EXAMPLE-CHEL'));
  assert.deepEqual(f.totals['northwest-philadelphia'], { utm_matched_in_sponsor_system: { qualified_lead: 1, enrollment: 1 }, self_reported_wwk_mention: { qualified_lead: 0, enrollment: 0 } });
  // The cross-territory case (lead filed in NJ stream, enrollment at an NJ pool) never leaks into NWP.
  assert.equal(nwp.rows.reduce((n, r) => n + r.count, 0), 2);
});

test('exports are import-plan compatible (Phase 1 validateImport via planImport)', () => {
  const f = feed();
  for (const ex of Object.values(f.exports)) {
    const p = planImport(loadPilot(), ex, MAP);
    assert.equal(p.ok, true, JSON.stringify(p.errors));
    assert.match(p.batch.source_label, /^Jackrabbit week totals \(BSS Messenger\)$/);
  }
});

test('deterministic and order-independent; day granularity works; misaligned or oversized periods refuse', () => {
  const a = feed(); const s = streams(); s.reverse(); for (const x of s) x.events.reverse();
  assert.deepEqual(feed(s), a);
  const d = feed(streams(), { ...OPTS, granularity: 'day' });
  assert.equal(d.ok, true, JSON.stringify(d.errors));
  assert.equal(d.exports['jersey-shore'].rows.length, 14 * 3 * 2 * 2);
  assert.equal(feed(streams(), { ...OPTS, to: '2026-11-12' }).errors[0].code, 'granularity_mismatch');
  assert.equal(feed(streams(), { ...OPTS, granularity: 'day', to: '2026-12-31', exportedOn: '2027-01-01' }).errors[0].code, 'too_many_rows');
  assert.equal(feed(streams(), { ...OPTS, granularity: 'month' }).errors[0].code, 'invalid_granularity');
  assert.equal(buildConversionFeed(loadPilot(), [{ nope: 1 }], MAP, OPTS).errors[0].code, 'invalid_events');
});

test('PII and identifiers never leave the adapter', () => {
  const out = JSON.stringify(feed()) + JSON.stringify(feed(streams(), { ...OPTS, granularity: 'day' }));
  for (const v of [...PII.names, ...PII.emails, ...PII.phones, '555-0142', '5550199', 'sentinel', 'x1@', 'nobody@']) assert.equal(out.toLowerCase().includes(v.toLowerCase()), false, `leaked ${v}`);
  assert.doesNotMatch(out, /@|\d{7,}/, 'no email-shaped or phone-shaped value');
});

test('CLI conversion-feed: explicit two files outside the repo; aggregate-only stdout; writes only outside the repo', () => {
  const dir = mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'wwk-feed-test-'));
  const [pa, nj] = streams();
  writeFileSync(join(dir, 'pa.json'), JSON.stringify(pa)); writeFileSync(join(dir, 'nj.json'), JSON.stringify(nj)); writeFileSync(join(dir, 'map.json'), JSON.stringify(MAP));
  const out = []; const say = (s) => out.push(s);
  const base = ['conversion-feed', PILOT_PATH, '--events', join(dir, 'pa.json'), '--events', join(dir, 'nj.json'), '--map', join(dir, 'map.json'), '--to', '2026-11-15', '--exported-on', '2026-11-16'];
  assert.equal(run(base, { stdout: say }), 0);
  const dry = JSON.parse(out.at(-1));
  assert.equal(dry.mode, 'dry-run');
  assert.ok(Object.values(dry.summary.import_checks).every((c) => c.import_compatible));
  assert.equal(run(['conversion-feed', PILOT_PATH, '--events', join(dir, 'pa.json'), '--map', join(dir, 'map.json'), '--to', '2026-11-15', '--exported-on', '2026-11-16'], { stdout: say }), 2, 'needs two files');
  assert.equal(run([...base.slice(0, 4), '--events', join(dir, 'pa.json'), ...base.slice(6)], { stdout: say }), 2, 'files must differ');
  assert.equal(run(['conversion-feed', PILOT_PATH, '--events', join(ONBOARDING_ROOT, 'examples/location-map.example.json'), '--events', join(dir, 'nj.json'), '--map', join(dir, 'map.json'), '--to', '2026-11-15', '--exported-on', '2026-11-16'], { stdout: say }), 2, 'events inside repo refused');
  assert.equal(run([...base, '--write'], { stdout: say }), 2, '--write needs --out');
  assert.equal(run([...base, '--write', '--out', join(ONBOARDING_ROOT, 'out', 'feed')], { stdout: say }), 2, 'output inside repo refused');
  const outDir = join(dir, 'out');
  assert.equal(run([...base, '--write', '--out', outDir], { stdout: say }), 0);
  assert.deepEqual(readdirSync(join(outDir, 'feed')).sort(), ['jersey-shore.aggregate-conversions.json', 'northwest-philadelphia.aggregate-conversions.json', 'summary.json']);
  const everything = out.join('\n') + readdirSync(join(outDir, 'feed')).map((f) => readFileSync(join(outDir, 'feed', f), 'utf8')).join('\n');
  for (const v of [...PII.names, ...PII.emails, ...PII.phones, 'sentinel']) assert.equal(everything.includes(v), false, `CLI leaked ${v}`);
  // The written export feeds straight into import-plan.
  assert.equal(run(['import-plan', PILOT_PATH, '--export', join(outDir, 'feed/jersey-shore.aggregate-conversions.json'), '--map', join(dir, 'map.json')], { stdout: say }), 0);
  void clone;
});
