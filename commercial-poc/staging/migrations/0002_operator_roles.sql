-- Migration 0002: explicit WWK operator administration.
-- Operator roles are separate from tenant memberships: a tenant owner/viewer
-- remains scoped, while an administrator can inspect every current and future
-- tenant. Identity still comes from Cloudflare Access and users.auth_subject.

CREATE TABLE IF NOT EXISTS operator_roles (
  user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  role    TEXT NOT NULL CHECK (role = 'admin'),
  granted_at TEXT NOT NULL,
  granted_by TEXT NOT NULL
);

INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('schema_version', '2');
