import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { PATHS, ageProgram, createTools } from "../src/core.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");
const paths = new Map([
  [PATHS.schools, "assets/data/api/v1/schools.json"],
  [PATHS.zipPoints, "assets/data/wwk-zip-points.json"],
  [PATHS.prices, "assets/data/price-index/pilot-observations.json"],
  [PATHS.levels, "assets/data/level-crosswalk/v0.1.json"],
  [PATHS.laws, "assets/data/law-atlas/v0.1.json"],
]);

async function loadFixture(path) {
  return JSON.parse(await readFile(resolve(root, paths.get(path)), "utf8"));
}

const tools = createTools(loadFixture);

test("maps numeric and named ages", () => {
  assert.equal(ageProgram(0.5), "infant");
  assert.equal(ageProgram(4), "preschool");
  assert.equal(ageProgram("kids"), "school-age");
  assert.throws(() => ageProgram(-1), /negative/);
});

test("finder returns limited directory records and preserves limitations", async () => {
  const result = await tools.findSwimSchools({ zip: "07728", radius_miles: 100, age: 4 });
  assert.equal(result.status, "ok");
  assert.ok(result.results.length <= 20);
  assert.match(result.limitation, /not a safety certification/i);
  assert.match(result.limitation, /ZCTA centroids/i);
  assert.match(result.ownership_disclosure, /British Swim School/i);
});

test("price tool cannot claim a benchmark", async () => {
  const result = await tools.getPriceBenchmark({ state: "NJ" });
  assert.equal(result.benchmark_status, "not_publishable");
  assert.ok(Array.isArray(result.observations));
  assert.equal("headline" in result, false);
});

test("law tool distinguishes verified pilot and unpublished states", async () => {
  assert.equal((await tools.getStateLaws({ state: "NJ" })).status, "verified_pilot_record");
  assert.equal(
    (await tools.getStateLaws({ state: "CA" })).status,
    "state_module_not_yet_published",
  );
});

test("crosswalk requires assessment", async () => {
  const source = await loadFixture(PATHS.levels);
  const system = source.systems[0];
  const level = system.levels[0];
  const result = await tools.translateLevel({ chain: system.id, level: level.id });
  assert.equal(result.status, "approximate_descriptive_overlap");
  assert.match(result.required_next_step, /must assess/i);
});
