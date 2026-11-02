// Seed manifest builder. Reads repository sources READ-ONLY, merges them with the
// recorded official-operator snapshot, and reports every disagreement instead of
// resolving it. Location status is never guessed: anything the sources disagree on,
// or that the official page marks as having no classes, is held back from placements.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { stableId } from './ids.mjs';

export function normalizeUrl(url) {
  const u = new URL(url);
  let path = u.pathname.replace(/\/+$/, '/');
  if (!path.endsWith('/')) path += '/';
  return `https://${u.hostname.toLowerCase()}${path.toLowerCase()}`;
}

const ABBREV = [
  [/\broad\b/g, 'rd'], [/\bavenue\b/g, 'ave'], [/\bstreet\b/g, 'st'], [/\bplace\b/g, 'pl'],
  [/\bsuite\b/g, 'ste'], [/\bwest\b/g, 'w'], [/\beast\b/g, 'e'], [/\bboulevard\b/g, 'blvd'],
  [/\bnew york\b/g, 'new york'], [/\bus\b$/g, ''],
];

export function normalizeAddress(addr) {
  if (!addr) return '';
  let s = String(addr).toLowerCase().replace(/[.,#()]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [re, rep] of ABBREV) s = s.replace(re, rep);
  s = s.replace(/\b(nj|pa|ny) (\d{4})$/, (_m, st, z) => `${st} 0${z}`);
  return s.replace(/\s+/g, ' ').trim();
}

function addressParts(addr) {
  const n = normalizeAddress(addr);
  const number = (n.match(/^(\d+)/) || [])[1] || null;
  const zip = (n.match(/(\d{5})$/) || [])[1] || null;
  return { normalized: n, number, zip };
}

function loadDirectoryData(repoRoot, relPath) {
  const src = readFileSync(join(repoRoot, relPath), 'utf8');
  // Parse as data, never execute repository JavaScript.
  const start = src.indexOf('{');
  const end = src.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error(`cannot locate object literal in ${relPath}`);
  return JSON.parse(src.slice(start, end + 1));
}

function readCanonical(repoRoot, pageFile) {
  const full = join(repoRoot, pageFile);
  if (!existsSync(full)) return null;
  const html = readFileSync(full, 'utf8');
  const m = html.match(/<link[^>]*rel="canonical"[^>]*>/i);
  const href = m && (m[0].match(/href="([^"]+)"/i) || [])[1];
  if (!href) return { canonical_url: null, page_path: null };
  const u = new URL(href);
  return { canonical_url: href, page_path: u.pathname };
}

function* walkHtml(dir, root) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules' || name === 'commercial-poc' || name.endsWith('.app')) continue;
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) yield* walkHtml(full, root);
    else if (name.endsWith('.html')) yield relative(root, full);
  }
}

/** Every britishswimschool.com link under a territory, with the files that use it. */
function scanTerritoryLinks(repoRoot, territoryKey) {
  const re = new RegExp(`https://britishswimschool\\.com/${territoryKey}/[^"'\\s<>]*`, 'g');
  const found = new Map();
  for (const rel of walkHtml(repoRoot, repoRoot)) {
    const html = readFileSync(join(repoRoot, rel), 'utf8');
    for (const m of html.matchAll(re)) {
      const url = m[0];
      if (!found.has(url)) found.set(url, new Set());
      found.get(url).add(rel);
    }
  }
  return found;
}

export function buildManifest({ repoRoot, pocRoot, config, snapshot, generatedAt = new Date().toISOString(), scanLinks = true }) {
  const directory = loadDirectoryData(repoRoot, config.repo_sources.directory_data);
  const geo = JSON.parse(readFileSync(join(repoRoot, config.repo_sources.directory_geo), 'utf8'));
  const conflicts = [];
  const addConflict = (c) => conflicts.push({ id: `C${String(conflicts.length + 1).padStart(2, '0')}`, resolution: 'reported_not_resolved', ...c });

  const out = {
    manifest_version: 1,
    generated_at: generatedAt,
    generator: 'commercial-poc/scripts/build-manifest.mjs',
    fixture_notice: 'Local POC fixture. Campaign dates, placements and users are fixtures; nothing here is live or approved.',
    sources: {
      repo_directory_data: config.repo_sources.directory_data,
      repo_directory_geo: config.repo_sources.directory_geo,
      repo_directory_geo_verified_on: geo.verified_on,
      repo_directory_geo_venues_verified_on: geo.venues_verified_on,
      official_snapshot: config.official_snapshot,
      official_snapshot_observed_on: snapshot.observed_on,
    },
    allowed_site_hosts: config.allowed_site_hosts,
    allowed_destination_hosts: config.allowed_destination_hosts,
    tenants: [], schools: [], locations: [], destinations: [], campaigns: [], placements: [],
    placement_pages: [], placement_destinations: [], users: [], memberships: [],
    skipped_placements: [], conflicts,
  };

  for (const t of config.tenants) {
    const official = snapshot.territories.find((x) => x.territory_key === t.tenant_key);
    if (!official) throw new Error(`no official snapshot for ${t.tenant_key}`);
    const territoryUrl = normalizeUrl(official.territory_url);
    const tenantId = stableId('ten', territoryUrl);
    const schoolId = stableId('sch', territoryUrl);
    out.tenants.push({ tenant_id: tenantId, tenant_key: t.tenant_key, display_name: t.display_name, timezone: t.timezone, pilot_status: 'pilot_fixture', pilot_price_cents: 0 });

    const rows = (directory[t.directory_state] || []).filter((r) => (r.website || '').toLowerCase().includes(`britishswimschool.com/${t.tenant_key}/`));
    const geoRows = geo.rows.filter((r) => r.state === t.directory_state);
    const geoVenues = (geo.venues || []).filter((v) => v.name === official.school_name);

    out.schools.push({
      school_id: schoolId, tenant_id: tenantId, display_name: official.school_name, official_url: official.territory_url,
      sources: [
        { source: 'official_snapshot', observed_on: snapshot.observed_on, url: official.territory_url },
        ...rows.map((r) => ({ source: 'repo_directory_data', row_name: r.name, website: r.website })),
      ],
    });

    const territoryDest = { destination_id: stableId('dst', territoryUrl), tenant_id: tenantId, location_id: null, display_name: `${official.school_name} (official site)`, url: official.territory_url, host: new URL(official.territory_url).hostname };
    out.destinations.push(territoryDest);

    const locById = new Map();
    for (const loc of official.locations) {
      const locUrl = normalizeUrl(loc.location_url);
      const locationId = stableId('loc', locUrl);
      // Match the official location to WWK directory sources.
      const dirRow = rows.find((r) => normalizeUrl(r.website) === locUrl);
      const dirVenue = rows.flatMap((r) => (r.poolAddresses || []).map((p) => ({ ...p, row: r.name })))
        .find((p) => p.venue.toLowerCase().replace(/[’']/g, "'").replace(/[–-]/g, '-') === loc.venue.toLowerCase().replace(/[’']/g, "'").replace(/[–-]/g, '-'));
      const geoRow = dirRow ? geoRows.find((g) => g.name === dirRow.name) : null;
      const geoVenue = geoVenues.find((v) => normalizeUrl(v.url) === locUrl);
      const inWwk = Boolean(dirRow || dirVenue);
      const reasons = [];
      let status = 'eligible_fixture';

      const sources = [{ source: 'official_snapshot', observed_on: snapshot.observed_on, address: loc.address, url: loc.location_url, no_classes_notice: loc.no_classes_notice }];
      if (dirRow) sources.push({ source: 'repo_directory_data', row_name: dirRow.name, address: dirRow.address || null, website: dirRow.website });
      if (dirVenue) sources.push({ source: 'repo_directory_data.poolAddresses', row_name: dirVenue.row, venue: dirVenue.venue, address: dirVenue.address });
      if (geoRow) sources.push({ source: 'repo_directory_geo.rows', row_name: geoRow.name, address: geoRow.address, method: geoRow.method });
      if (geoVenue) sources.push({ source: 'repo_directory_geo.venues', venue: geoVenue.venue, address: geoVenue.address || null, note: geoVenue.contact_note || null });

      if (!inWwk) {
        status = 'needs_owner_confirmation';
        reasons.push('Listed on the official territory page but absent from the WWK directory data.');
        addConflict({ severity: 'warn', kind: 'official_location_missing_from_wwk', tenant_key: t.tenant_key, subject: loc.venue,
          detail: `Official territory page lists ${loc.venue} (${loc.location_url}); no matching row or pool venue exists in ${config.repo_sources.directory_data}.`,
          effect: 'Location held at needs_owner_confirmation; no placement or destination is created for it.' });
      }
      if (loc.no_classes_notice) {
        status = 'needs_owner_confirmation';
        reasons.push('Official location page states there are currently no classes available.');
        addConflict({ severity: 'warn', kind: 'official_no_classes_notice', tenant_key: t.tenant_key, subject: loc.venue,
          detail: `${loc.location_url} states "no classes available" while still listed on the territory page. Active status cannot be inferred.`,
          effect: 'Location held at needs_owner_confirmation; owner must confirm whether it should be promoted.' });
      }
      if (loc.address_conflict) {
        if (status === 'eligible_fixture') status = 'needs_address_confirmation';
        reasons.push(`Official location page shows conflicting street addresses: ${loc.address_conflict.join(' vs ')}.`);
        addConflict({ severity: 'warn', kind: 'official_address_conflict', tenant_key: t.tenant_key, subject: loc.venue,
          detail: `${loc.location_url} shows ${loc.address_conflict.join(' and ')} on the same page.${geoVenue && geoVenue.contact_note ? ` WWK geo file already notes: "${geoVenue.contact_note}"` : ''}${!dirVenue ? ' The venue is also absent from the directory poolAddresses list.' : ''}`,
          effect: 'Street address withheld from the manifest; location not featured or linked as a destination until confirmed.' });
      }

      // Address comparison across sources (substantive differences only).
      const addrSources = sources.filter((s) => s.address).map((s) => ({ source: s.source, value: s.address, parts: addressParts(s.address) }));
      if (loc.location_page_address) addrSources.push({ source: 'official_location_page', value: loc.location_page_address, parts: addressParts(loc.location_page_address) });
      const distinct = [...new Set(addrSources.map((a) => a.parts.normalized))];
      if (!loc.address_conflict && distinct.length > 1) {
        const numbers = new Set(addrSources.map((a) => a.parts.number).filter(Boolean));
        const zips = new Set(addrSources.map((a) => a.parts.zip).filter(Boolean));
        const substantive = numbers.size > 1 || zips.size > 1;
        addConflict({ severity: substantive ? 'warn' : 'info', kind: 'address_text_differs', tenant_key: t.tenant_key, subject: loc.venue,
          detail: 'Sources render this address differently: ' + addrSources.map((a) => `${a.source}: "${a.value}"`).join('; '),
          effect: substantive ? 'Street number or ZIP differs; address withheld until confirmed.' : 'Same street number and ZIP; display uses the official snapshot text. No status change.' });
        if (substantive && status === 'eligible_fixture') status = 'needs_address_confirmation';
      }
      if ((loc.location_page_notes || []).some((n) => /ZIP/.test(n))) {
        addConflict({ severity: 'info', kind: 'official_zip_formatting', tenant_key: t.tenant_key, subject: loc.venue,
          detail: loc.location_page_notes.find((n) => /ZIP/.test(n)), effect: 'Manifest uses the five-digit ZIP; no status change.' });
      }
      if (inWwk && !geoRow && !geoVenue) {
        addConflict({ severity: 'info', kind: 'no_verified_geo_point', tenant_key: t.tenant_key, subject: loc.venue,
          detail: `No verified coordinate in ${config.repo_sources.directory_geo}.`, effect: 'No effect on Phase 1; distance features would omit it.' });
      }

      const addressDisplay = (status === 'needs_address_confirmation' || loc.address_conflict) ? null : loc.address;
      const record = { location_id: locationId, tenant_id: tenantId, school_id: schoolId, display_name: loc.venue, address_display: addressDisplay,
        official_url: loc.location_url, status, status_reason: reasons.length ? reasons.join(' ') : 'Listed on the official territory page and in WWK directory data; no conflicting notice observed. Fixture eligibility only; live status requires owner confirmation.',
        verified_on: snapshot.observed_on, sources };
      out.locations.push(record);
      locById.set(locUrl, record);
      if (status === 'eligible_fixture') {
        out.destinations.push({ destination_id: stableId('dst', locUrl), tenant_id: tenantId, location_id: locationId, display_name: `${loc.venue} (official location page)`, url: loc.location_url, host: new URL(loc.location_url).hostname });
      }
    }

    // WWK directory rows that the official snapshot does not list.
    for (const r of rows) {
      const u = normalizeUrl(r.website);
      if (u !== territoryUrl && !locById.has(u)) {
        addConflict({ severity: 'warn', kind: 'wwk_location_not_on_official_page', tenant_key: t.tenant_key, subject: r.name,
          detail: `WWK directory row links ${r.website}, which the official territory page does not list.`, effect: 'Row ignored for placements.' });
      }
    }

    // Link variants used across WWK pages.
    if (scanLinks) {
      const links = scanTerritoryLinks(repoRoot, t.tenant_key);
      const known = new Set([territoryUrl, ...official.locations.map((l) => normalizeUrl(l.location_url))]);
      for (const [url, files] of links) {
        let n;
        try { n = normalizeUrl(url); } catch { continue; }
        if (!known.has(n)) {
          const alt = official.locations.find((l) => (l.alternate_urls_observed || []).map(normalizeUrl).includes(n));
          addConflict({ severity: 'info', kind: 'wwk_link_variant', tenant_key: t.tenant_key, subject: url,
            detail: `${files.size} WWK page(s) link ${url}${alt ? `, an alternate path for ${alt.venue} that also loads on the official site` : ', which is not a URL listed on the official territory page'}. Files: ${[...files].sort().join(', ')}.`,
            effect: 'Destinations in the manifest use only the official listed URL. Link cleanup is a Phase 2 proposal, not applied.' });
        }
      }
    }

    // Campaigns.
    const fw = config.fixture_window;
    const sponsoredCampaign = { campaign_id: stableId('cmp', `${territoryUrl}#sponsored-pilot-2026`), tenant_id: tenantId, school_id: schoolId, kind: 'sponsored_pilot',
      display_name: 'Sponsored pilot (fixture)', disclosure_label: 'Sponsored pilot', price_cents: 0, starts_on: fw.sponsored_starts_on, ends_on: fw.campaign_ends_on };
    const baselineCampaign = { campaign_id: stableId('cmp', `${territoryUrl}#organic-baseline-2026`), tenant_id: tenantId, school_id: schoolId, kind: 'organic_baseline',
      display_name: 'Ordinary directory listing (measurement only, not sold)', disclosure_label: null, price_cents: 0, starts_on: fw.baseline_starts_on, ends_on: fw.campaign_ends_on };
    out.campaigns.push(sponsoredCampaign, baselineCampaign);

    const eligibleDestinations = out.destinations.filter((d) => d.tenant_id === tenantId && d.location_id);

    for (const card of t.sponsored_cards) {
      const page = readCanonical(repoRoot, card.page_file);
      const featured = card.featured_location_url ? locById.get(normalizeUrl(card.featured_location_url)) : null;
      if (!page || !page.page_path) {
        out.skipped_placements.push({ tenant_key: t.tenant_key, slot_key: card.slot_key, reason: `Page ${card.page_file} not found or has no canonical URL.` });
        continue;
      }
      if (card.featured_location_url && (!featured || featured.status !== 'eligible_fixture')) {
        out.skipped_placements.push({ tenant_key: t.tenant_key, slot_key: card.slot_key, page_path: page.page_path,
          reason: `Featured location ${card.featured_location_url} is ${featured ? featured.status : 'unknown'}; placement not created.` });
        continue;
      }
      const placementId = stableId('plc', `${territoryUrl}#${card.slot_key}`);
      out.placements.push({ placement_id: placementId, tenant_id: tenantId, campaign_id: sponsoredCampaign.campaign_id, kind: 'sponsored_card',
        display_name: `Sponsored card: ${page.page_path}`, featured_location_id: featured ? featured.location_id : null, link_rel: 'sponsored noopener', inventory_status: 'fixture_candidate', slot_key: card.slot_key });
      out.placement_pages.push({ placement_id: placementId, tenant_id: tenantId, page_path: page.page_path, canonical_url: page.canonical_url, source_file: card.page_file });
      const dests = featured
        ? [territoryDest, eligibleDestinations.find((d) => d.location_id === featured.location_id)]
        : [territoryDest, ...eligibleDestinations];
      for (const d of dests) out.placement_destinations.push({ placement_id: placementId, destination_id: d.destination_id, tenant_id: tenantId });
    }

    // Ordinary (organic) listing measurement placements, one per WWK directory row.
    const orgPage = readCanonical(repoRoot, t.organic_listing_page_file);
    for (const r of rows) {
      const u = normalizeUrl(r.website);
      const loc = locById.get(u);
      if (u !== territoryUrl && (!loc || loc.status !== 'eligible_fixture')) continue;
      const placementId = stableId('plc', `${territoryUrl}#organic:${u}`);
      out.placements.push({ placement_id: placementId, tenant_id: tenantId, campaign_id: baselineCampaign.campaign_id, kind: 'organic_listing',
        display_name: `Ordinary listing: ${r.name}`, featured_location_id: loc ? loc.location_id : null, link_rel: null, inventory_status: 'fixture_candidate', slot_key: `organic:${r.name}` });
      out.placement_pages.push({ placement_id: placementId, tenant_id: tenantId, page_path: orgPage.page_path, canonical_url: orgPage.canonical_url, source_file: t.organic_listing_page_file });
      const dest = loc ? eligibleDestinations.find((d) => d.location_id === loc.location_id) : territoryDest;
      out.placement_destinations.push({ placement_id: placementId, destination_id: dest.destination_id, tenant_id: tenantId });
    }
  }

  const man = out.tenants.find((x) => x.tenant_key === 'manhattan');
  if (man) {
    addConflict({ severity: 'info', kind: 'inventory_gap', tenant_key: 'manhattan', subject: 'Manhattan page inventory',
      detail: 'WWK has no Manhattan-specific local guide page; the only Manhattan surface is the New York state directory (/swim-lessons/directory/new-york.html), which also carries the ordinary listing.',
      effect: 'Fixture sponsored card and ordinary listing share that page. Phase 2 must propose inventory; creating new city pages is outside agent authority.' });
  }

  for (const u of config.demo_users) {
    const userId = stableId('usr', `demo:${u.user_key}`);
    out.users.push({ user_id: userId, user_key: u.user_key, display_label: u.display_label, is_demo: 1 });
    for (const m of u.memberships) {
      const tenant = out.tenants.find((x) => x.tenant_key === m.tenant_key);
      out.memberships.push({ tenant_id: tenant.tenant_id, user_id: userId, role: m.role });
    }
  }
  return out;
}

export function conflictsMarkdown(manifest) {
  const lines = [
    '# Pilot source-of-truth conflicts',
    '',
    `Generated by \`${manifest.generator}\` at ${manifest.generated_at}. Do not edit by hand; re-run the builder.`,
    '',
    `Official snapshot observed on ${manifest.sources.official_snapshot_observed_on}. Repository geo verified on ${manifest.sources.repo_directory_geo_verified_on} (venues ${manifest.sources.repo_directory_geo_venues_verified_on}).`,
    '',
    'Every item below is **reported, not resolved**. Owner confirmation is required before any held location gets a placement.',
    '',
    '| ID | Severity | Kind | Tenant | Subject | Detail | Effect |',
    '|---|---|---|---|---|---|---|',
  ];
  const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  for (const c of manifest.conflicts) lines.push(`| ${c.id} | ${c.severity} | ${c.kind} | ${c.tenant_key} | ${esc(c.subject)} | ${esc(c.detail)} | ${esc(c.effect)} |`);
  lines.push('', '## Location status', '', '| Tenant | Location | Status | Reason |', '|---|---|---|---|');
  for (const l of manifest.locations) {
    const t = manifest.tenants.find((x) => x.tenant_id === l.tenant_id);
    lines.push(`| ${t.tenant_key} | ${esc(l.display_name)} | ${l.status} | ${esc(l.status_reason)} |`);
  }
  lines.push('', '## Placements not created', '', '| Tenant | Slot | Reason |', '|---|---|---|');
  for (const s of manifest.skipped_placements) lines.push(`| ${s.tenant_key} | ${s.slot_key} | ${esc(s.reason)} |`);
  lines.push('');
  return lines.join('\n');
}
