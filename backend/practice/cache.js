const { redis } = require('../src/db');
const { buildReport } = require('../src/report');

const TTL = Number(process.env.CACHE_TTL) || 60; // seconds

// ==========================================================
//  PRACTICE: Is function ko complete karo
//  Abhi ye har baar seedha MongoDB pe ja raha hai (koi caching nahi)
//  Isliye "With Cache" button bhi abhi slow hi chalega.
//
//  Redis commands jo kaam aayenge:
//    await redis.get(key)                          -> string ya null
//    await redis.set(key, value, { EX: seconds })  -> save with expiry
//    JSON.stringify(obj) / JSON.parse(str)         -> Redis sirf string rakhta hai
// ==========================================================
async function getReportWithCache(city) {
  const key = `report:${city}`;

  // TODO 1: redis.get(key) se check karo ki data cache me hai ya nahi
  // TODO 2: agar mila -> return { cache: 'HIT', data: JSON.parse(cached) }

  const data = await buildReport(city);

  // TODO 3: data ko Redis me save karo TTL ke saath

  return { cache: 'MISS', data };
}

// ==========================================================
//  PRACTICE: Cache invalidation
//  Jab koi naya student add hota hai to purani report galat ho jaati hai.
//  Pehle isko khaali chhod ke "Add Student" dabao -> report me count
//  nahi badlega (STALE DATA!). Phir isko complete karo.
// ==========================================================
async function invalidateReport(city) {
  // TODO 4: `report:${city}` aur 'report:all' dono keys delete karo
  //         hint: await redis.del([key1, key2])
}

module.exports = { getReportWithCache, invalidateReport };
