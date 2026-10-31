const { redis } = require('./db');
const { buildReport } = require('./report');

const TTL = Number(process.env.CACHE_TTL) || 60; // seconds

// ==========================================================
//  CACHE-ASIDE PATTERN (sabse common caching pattern)
//
//  1. Pehle Redis se poocho: "ye data hai tere paas?"
//  2. Hai (HIT)  -> wahi return karo, MongoDB ko chhuo bhi mat
//  3. Nahi (MISS) -> MongoDB se lao, Redis me TTL ke saath rakh do,
//                    phir return karo
// ==========================================================
async function getReportWithCache(city) {
  const key = `report:${city}`;

  // Step 1: Redis check
  const cached = await redis.get(key);
  if (cached) {
    return { cache: 'HIT', data: JSON.parse(cached) };
  }

  // Step 2: MongoDB se lao (slow wala kaam)
  const data = await buildReport(city);

  // Step 3: Redis me save karo, TTL ke saath (EX = expire in seconds)
  await redis.set(key, JSON.stringify(data), { EX: TTL });

  return { cache: 'MISS', data };
}

// ==========================================================
//  CACHE INVALIDATION
//  DB me data badla -> purana cache galat (stale) ho gaya
//  -> us city ka aur "all" ka cache delete kar do
// ==========================================================
async function invalidateReport(city) {
  await redis.del([`report:${city}`, 'report:all']);
}

module.exports = { getReportWithCache, invalidateReport };
