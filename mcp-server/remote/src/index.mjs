import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";

import { createHttpJsonLoader, createTools } from "./core.mjs";

const SERVER_NAME = "waterwisekids-open-data";
const SERVER_VERSION = "0.2.0";
const MAX_BODY_BYTES = 64 * 1024;
const BURST_LIMIT = 30;
const BURST_WINDOW_MS = 10_000;
const MAX_BURST_KEYS = 2_048;
const burstBuckets = new Map();

function toolResult(value) {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
  };
}

function toolError(error) {
  const message = error instanceof Error ? error.message : "Unexpected tool error";
  return { content: [{ type: "text", text: message }], isError: true };
}

export function createServer(env, fetchImpl = fetch) {
  const loader = createHttpJsonLoader(env.DATA_ORIGIN, fetchImpl);
  const tools = createTools(loader);
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  server.registerTool(
    "find_swim_schools",
    {
      description:
        "Find directory entries near a U.S. ZIP centroid. Results are not a complete provider census or an endorsement.",
      inputSchema: z.object({
        zip: z.string().regex(/^\d{5}$/),
        age: z.union([z.number(), z.string()]).optional(),
        indoor: z.boolean().optional(),
        radius_miles: z.number().min(1).max(100).optional(),
      }),
    },
    async (args) => {
      try {
        return toolResult(await tools.findSwimSchools(args));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "get_price_benchmark",
    {
      description:
        "Return source-checked pilot observations for one state. Refuses to label them a benchmark while publication gates fail.",
      inputSchema: z.object({ state: z.string().regex(/^[A-Za-z]{2}$/) }),
    },
    async (args) => {
      try {
        return toolResult(await tools.getPriceBenchmark(args));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "translate_level",
    {
      description:
        "Return approximate skill-band overlaps across lesson systems. Never use the result for placement without a receiving-school assessment.",
      inputSchema: z.object({ chain: z.string().min(1), level: z.string().min(1) }),
    },
    async (args) => {
      try {
        return toolResult(await tools.translateLevel(args));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "get_state_laws",
    {
      description:
        "Return a source-linked pilot law record or an explicit unpublished status. Plain-language information, not legal advice.",
      inputSchema: z.object({ state: z.string().regex(/^[A-Za-z]{2}$/) }),
    },
    async (args) => {
      try {
        return toolResult(await tools.getStateLaws(args));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  return server;
}

function jsonResponse(value, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}

function requestHostname(request) {
  return new URL(request.url).hostname.toLowerCase();
}

function hostAllowed(request, env) {
  const hostname = requestHostname(request);
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  return hostname === String(env.PUBLIC_HOSTNAME ?? "").toLowerCase();
}

async function withinRateLimit(request, env) {
  if (!env.MCP_RATE_LIMITER) {
    return env.RUNTIME_ENV === "local" || requestHostname(request) === "localhost";
  }
  const key = request.headers.get("cf-connecting-ip") ?? "missing-client-ip";
  const now = Date.now();
  let bucket = burstBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    if (!bucket && burstBuckets.size >= MAX_BURST_KEYS) {
      for (const [candidateKey, candidate] of burstBuckets) {
        if (now >= candidate.resetAt) burstBuckets.delete(candidateKey);
      }
      if (burstBuckets.size >= MAX_BURST_KEYS) return false;
    }
    bucket = { count: 0, resetAt: now + BURST_WINDOW_MS };
    burstBuckets.set(key, bucket);
  }
  if (bucket.count >= BURST_LIMIT) return false;
  bucket.count += 1;
  const result = await env.MCP_RATE_LIMITER.limit({ key });
  return result.success;
}

async function withBoundedBody(request) {
  if (!request.body) return request;
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel("request_too_large");
      return null;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new Request(request, { body });
}

export async function handleRequest(request, env, ctx, fetchImpl = fetch) {
  if (!hostAllowed(request, env)) {
    return jsonResponse({ error: "host_not_allowed" }, 421);
  }
  const url = new URL(request.url);
  if (url.pathname === "/health" && request.method === "GET") {
    return jsonResponse({
      status: "ok",
      service: SERVER_NAME,
      version: SERVER_VERSION,
      mode: "read_only",
      data_origin: env.DATA_ORIGIN,
    });
  }
  if (url.pathname !== "/mcp") {
    return jsonResponse({ error: "not_found" }, 404);
  }
  let boundedRequest = request;
  if (request.method === "POST") {
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: "request_too_large" }, 413);
    }
  }
  if (!(await withinRateLimit(request, env))) {
    return jsonResponse({ error: "rate_limited_or_unavailable" }, 429, { "retry-after": "60" });
  }
  if (request.method === "POST") {
    boundedRequest = await withBoundedBody(request);
    if (!boundedRequest) return jsonResponse({ error: "request_too_large" }, 413);
  }

  const handler = createMcpHandler(() => createServer(env, fetchImpl), {
    route: "/mcp",
    corsOptions: {
      origin: "https://www.waterwisekids.com",
      methods: "GET, POST, OPTIONS",
      headers: "content-type, authorization, mcp-protocol-version, mcp-session-id",
      exposeHeaders: "mcp-session-id",
      maxAge: 86400,
    },
    allowedHostnames: [env.PUBLIC_HOSTNAME, "localhost", "127.0.0.1"].filter(Boolean),
    allowedOriginHostnames: ["www.waterwisekids.com", "waterwisekids.com", "localhost"],
    legacy: "stateless",
    onerror(error) {
      console.error("MCP request failed", error instanceof Error ? error.message : "unknown error");
    },
  });
  return handler(boundedRequest, env, ctx);
}

export default {
  fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  },
};
