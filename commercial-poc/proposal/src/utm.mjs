// UTM contract for sponsored outbound links (static hrefs; never rewritten at runtime).
// Only campaign-level tags: no person, session, page-view, timestamp or page-URL value.
export const UTM_KEYS = Object.freeze(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']);

export function utmParams(contract, { campaignId, placementId }) {
  const vals = {};
  for (const k of UTM_KEYS) {
    vals[k] = String(contract[k]).replace('{campaign_id}', campaignId).replace('{placement_id}', placementId);
    if (!/^[a-z0-9_]{1,64}$/.test(vals[k])) throw new Error(`invalid UTM value for ${k}: ${vals[k]}`);
  }
  return vals;
}

/** Official URL + UTM query. The official URL must not already carry a query or fragment. */
export function taggedUrl(officialUrl, params) {
  const u = new URL(officialUrl);
  if (u.search || u.hash) throw new Error(`official URL must not carry query/fragment: ${officialUrl}`);
  for (const k of UTM_KEYS) u.searchParams.set(k, params[k]);
  return u.toString();
}
