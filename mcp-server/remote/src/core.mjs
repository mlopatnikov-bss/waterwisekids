const PATHS = Object.freeze({
  schools: "/assets/data/api/v1/schools.json",
  zipPoints: "/assets/data/wwk-zip-points.json",
  prices: "/assets/data/price-index/pilot-observations.json",
  levels: "/assets/data/level-crosswalk/v0.1.json",
  laws: "/assets/data/law-atlas/v0.1.json",
});

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} did not return a JSON object`);
  }
  return value;
}

export function createHttpJsonLoader(origin, fetchImpl = fetch) {
  const base = new URL(origin);
  if (base.protocol !== "https:") {
    throw new Error("DATA_ORIGIN must use HTTPS");
  }
  return async (path) => {
    const url = new URL(path, base);
    if (url.origin !== base.origin) {
      throw new Error("Refusing to fetch data outside DATA_ORIGIN");
    }
    const response = await fetchImpl(url, {
      headers: { accept: "application/json" },
      cf: { cacheEverything: true, cacheTtl: 900 },
    });
    if (!response.ok) {
      throw new Error(`Public dataset fetch failed (${response.status})`);
    }
    return assertObject(await response.json(), path);
  };
}

function parseZipPoints(raw) {
  const points = new Map();
  for (const row of raw.z ?? []) {
    const [zipcode, latitude, longitude] = row.split(",");
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (/^\d{5}$/.test(zipcode) && Number.isFinite(lat) && Number.isFinite(lon)) {
      points.set(zipcode, [lat, lon]);
    }
  }
  return points;
}

function haversineMiles(a, b) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const [lat1, lon1] = a.map(toRadians);
  const [lat2, lon2] = b.map(toRadians);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(value));
}

export function ageProgram(value) {
  if (value === undefined || value === null || value === "") return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    if (numeric < 0) throw new Error("age cannot be negative");
    if (numeric < 1) return "infant";
    if (numeric < 3) return "toddler";
    if (numeric < 6) return "preschool";
    if (numeric < 18) return "school-age";
    return "adult";
  }
  const normalized = String(value).trim().toLowerCase().replaceAll("_", "-");
  const aliases = new Map([
    ["baby", "infant"],
    ["child", "school-age"],
    ["kid", "school-age"],
    ["kids", "school-age"],
    ["school age", "school-age"],
  ]);
  return aliases.get(normalized) ?? normalized;
}

export function createTools(loadJson) {
  return {
    async findSwimSchools(args) {
      const zipcode = String(args.zip ?? "").trim();
      if (!/^\d{5}$/.test(zipcode)) {
        throw new Error("zip must be a five-digit U.S. ZIP code");
      }
      const requestedRadius = Number(args.radius_miles ?? 25);
      if (!Number.isFinite(requestedRadius)) throw new Error("radius_miles must be numeric");
      const radius = Math.min(Math.max(requestedRadius, 1), 100);
      const [zipData, schools] = await Promise.all([
        loadJson(PATHS.zipPoints),
        loadJson(PATHS.schools),
      ]);
      const points = parseZipPoints(zipData);
      if (!points.has(zipcode)) {
        return { status: "zip_not_in_census_zcta_file", zip: zipcode, results: [] };
      }
      const program = ageProgram(args.age);
      const results = [];
      for (const school of schools.records ?? []) {
        const schoolZip = school.postal_code;
        if (!schoolZip || !points.has(schoolZip)) continue;
        if (program && !(school.programs ?? []).includes(program)) continue;
        if (args.indoor === true && school.indoor !== true) continue;
        if (args.indoor === false && school.indoor !== false) continue;
        const distance = haversineMiles(points.get(zipcode), points.get(schoolZip));
        if (distance <= radius) {
          results.push({ ...school, approximate_distance_miles: Math.round(distance * 10) / 10 });
        }
      }
      results.sort(
        (left, right) =>
          left.approximate_distance_miles - right.approximate_distance_miles ||
          left.name.localeCompare(right.name),
      );
      return {
        status: "ok",
        zip: zipcode,
        radius_miles: radius,
        program_filter: program,
        results: results.slice(0, 20),
        result_limit: 20,
        ownership_disclosure:
          "WaterWiseKids is published by VTL Holding LLC, whose owner also operates British Swim School franchises serving the Jersey Shore and Northwest Philadelphia. Listings receive no endorsement or rank advantage.",
        limitation:
          `${schools.completeness}; listings are not a safety certification, rating, or endorsement; ` +
          "distance uses ZCTA centroids, not road travel time",
      };
    },

    async getPriceBenchmark(args) {
      const state = String(args.state ?? "").toUpperCase().trim();
      if (!/^[A-Z]{2}$/.test(state)) throw new Error("state must be a two-letter code");
      const data = await loadJson(PATHS.prices);
      return {
        state,
        benchmark_status: "not_publishable",
        reason: "National and state sampling gates have not passed; returning observations only.",
        publication_gates: data.publication_thresholds ?? null,
        observations: (data.observations ?? []).filter((row) => row.state === state),
      };
    },

    async translateLevel(args) {
      const chain = String(args.chain ?? "").toLowerCase().trim();
      const levelQuery = String(args.level ?? "").toLowerCase().trim();
      if (!chain || !levelQuery) throw new Error("chain and level are required");
      const data = await loadJson(PATHS.levels);
      const system = (data.systems ?? []).find(
        (item) => [item.id.toLowerCase(), item.name.toLowerCase()].includes(chain),
      );
      if (!system) {
        return {
          status: "system_not_found",
          available_systems: (data.systems ?? []).map(({ id, name }) => ({ id, name })),
        };
      }
      const level = (system.levels ?? []).find((item) =>
        [item.id.toLowerCase(), item.name.toLowerCase()].includes(levelQuery),
      );
      if (!level) {
        return {
          status: "level_not_found",
          system: system.name,
          available_levels: (system.levels ?? []).map(({ id, name }) => ({ id, name })),
        };
      }
      const low = Number(level.band_min.slice(1));
      const high = Number(level.band_max.slice(1));
      const matches = (data.systems ?? [])
        .filter((target) => target.id !== system.id)
        .map((target) => ({
          system: target.name,
          levels: (target.levels ?? []).filter(
            (item) => Number(item.band_min.slice(1)) <= high && Number(item.band_max.slice(1)) >= low,
          ),
        }));
      return {
        status: "approximate_descriptive_overlap",
        source_system: system.name,
        source_level: level,
        matches,
        required_next_step:
          "The receiving school must assess the swimmer; do not place or enroll from this mapping alone.",
        disclaimer: data.disclaimer,
      };
    },

    async getStateLaws(args) {
      const state = String(args.state ?? "").toUpperCase().trim();
      if (!/^[A-Z]{2}$/.test(state)) throw new Error("state must be a two-letter code");
      const data = await loadJson(PATHS.laws);
      const record = (data.jurisdictions ?? []).find(
        (item) => item.code === state || item.name.toUpperCase() === state,
      );
      if (!record) {
        return {
          status: "state_module_not_yet_published",
          state,
          federal_baseline: data.federal_baseline,
          disclaimer: data.disclaimer,
        };
      }
      return {
        status: "verified_pilot_record",
        jurisdiction: record,
        federal_baseline: data.federal_baseline,
        disclaimer: data.disclaimer,
      };
    },
  };
}

export { PATHS };
