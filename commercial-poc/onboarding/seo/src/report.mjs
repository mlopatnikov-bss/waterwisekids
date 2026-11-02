// Markdown/JSON rendering of an audit result. Deterministic for the same input.
export function toMarkdown({ map, findings, table, counts }, { title = 'Territory SEO audit' } = {}) {
  const lines = [`# ${title}`, '', `Map: territory-map.json (prepared ${map.prepared_on}). Errors ${counts.error}, warnings ${counts.warn}, info ${counts.info}.`, ''];
  lines.push('## Page map', '', '| Page | Role | Canonical OK | Sitemap | Inbound | Words | Sponsored | Schema |', '|---|---|---|---|---:|---:|---:|---|');
  for (const r of [...table].sort((a, b) => a.path.localeCompare(b.path))) {
    const self = r.canonical === `${map.site_origin}${r.path}`;
    lines.push(`| \`${r.path}\` | ${r.role} | ${r.role === 'primary' || r.role === 'related' ? (self ? 'self' : 'NO') : (self ? 'NO (self)' : 'to primary')} | ${r.in_sitemap ? 'yes' : 'no'} | ${r.inbound} | ${r.editorial_words} | ${r.sponsored_cards} | ${r.schema_types.join(', ')} |`);
  }
  lines.push('', '## Findings', '');
  if (!findings.length) lines.push('None.');
  for (const f of findings) lines.push(`- **${f.level}** \`${f.code}\` ${f.page}${f.detail ? ` — ${f.detail}` : ''}`);
  return `${lines.join('\n')}\n`;
}
