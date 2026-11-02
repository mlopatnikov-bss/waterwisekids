// Tiny helpers over the D1 binding API (prepare/bind/all/first/batch). The same
// calls run against Cloudflare D1 (local or remote) and against the Node test
// adapter in scripts/lib/d1-sqlite.mjs. Every value is passed as a bound parameter.
export const stmt = (db, sql, ...params) => db.prepare(sql).bind(...params);
export async function all(db, sql, ...params) {
  const r = await db.prepare(sql).bind(...params).all();
  return r.results;
}
export async function first(db, sql, ...params) {
  return db.prepare(sql).bind(...params).first();
}
export const isD1 = (db) => !!db && typeof db.prepare === 'function' && typeof db.batch === 'function';
