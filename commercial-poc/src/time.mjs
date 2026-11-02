// Time helpers. All stored timestamps are UTC; daily buckets use the tenant's
// IANA time zone (all three pilot tenants are America/New_York).

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

const formatterCache = new Map();
function partsFormatter(timeZone) {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hourCycle: 'h23',
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

function zonedParts(ms, timeZone) {
  const out = {};
  for (const p of partsFormatter(timeZone).formatToParts(new Date(ms))) out[p.type] = p.value;
  return out;
}

/** YYYY-MM-DD of an instant in a time zone. */
export function localDate(isoOrMs, timeZone) {
  const ms = typeof isoOrMs === 'number' ? isoOrMs : Date.parse(isoOrMs);
  const p = zonedParts(ms, timeZone);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Offset of a zone from UTC in minutes at an instant (e.g. -240 for EDT). */
export function tzOffsetMinutes(ms, timeZone) {
  const p = zonedParts(ms, timeZone);
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000);
}

/** UTC epoch ms for a wall-clock time in a zone. */
export function zonedToUtcMs(dateStr, hour, minute, second, timeZone) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d, hour, minute, second);
  let result = guess - tzOffsetMinutes(guess, timeZone) * 60000;
  const check = tzOffsetMinutes(result, timeZone);
  result = guess - check * 60000;
  return result;
}

export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

export function daysBetweenInclusive(from, to) {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86400000) + 1;
}

export function eachDate(from, to) {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function isValidDate(dateStr) {
  if (typeof dateStr !== 'string' || !DATE_RE.test(dateStr)) return false;
  const t = new Date(`${dateStr}T00:00:00Z`);
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === dateStr;
}

/** Truncate an ISO instant to the minute (privacy-safe precision). */
export function truncateToMinute(iso) {
  const ms = Date.parse(iso);
  return new Date(Math.floor(ms / 60000) * 60000).toISOString().replace('.000Z', 'Z');
}
