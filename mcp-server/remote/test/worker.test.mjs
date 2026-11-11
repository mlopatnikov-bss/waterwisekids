import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../src/index.mjs";

const localEnv = {
  DATA_ORIGIN: "https://www.waterwisekids.com",
  PUBLIC_HOSTNAME: "mcp.waterwisekids.com",
  RUNTIME_ENV: "local",
};

test("health endpoint reports read-only mode", async () => {
  const response = await handleRequest(new Request("http://localhost/health"), localEnv, {});
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.mode, "read_only");
});

test("unknown hosts fail closed", async () => {
  const response = await handleRequest(new Request("https://attacker.example/health"), localEnv, {});
  assert.equal(response.status, 421);
});

test("oversized MCP requests are rejected before parsing", async () => {
  const request = new Request("http://localhost/mcp", {
    method: "POST",
    headers: { "content-length": String(65 * 1024) },
    body: "{}",
  });
  const response = await handleRequest(request, localEnv, {});
  assert.equal(response.status, 413);
});

test("candidate host fails closed without a rate-limit binding", async () => {
  const request = new Request("https://mcp.waterwisekids.com/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  const response = await handleRequest(request, { ...localEnv, RUNTIME_ENV: "candidate" }, {});
  assert.equal(response.status, 429);
});
