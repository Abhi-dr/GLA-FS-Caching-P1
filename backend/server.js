const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { Student, redis, connectMongo, connectRedis } = require('./src/db');
const { buildReport } = require('./src/report');
const { CITIES, fakeStudent } = require('./src/data');

// `npm run practice` -> practice/cache.js (students wala, TODOs ke saath)
// `npm start`        -> src/cache.js      (complete solution)
const PRACTICE = process.argv.includes('--practice');
const CACHE_FILE = PRACTICE ? './practice/cache.js' : './src/cache.js';
const { getReportWithCache, invalidateReport } = require(CACHE_FILE);

const app = express();
app.use(cors()); // React (localhost:5173) se aane wali requests allow karo
app.use(express.json());
// Purana plain HTML version (optional): http://localhost:4000 pe khulta hai
app.use(express.static(path.join(__dirname, 'public')));

// Chhota helper: kisi bhi async kaam ka time milliseconds me naapta hai
async function timed(fn) {
  const start = process.hrtime.bigint();
  const result = await fn();
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  return { result, timeMs: Number(ms.toFixed(2)) };
}

// Express 4 async errors khud nahi pakadta, isliye ye wrapper
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

const cityFrom = (req) => (CITIES.includes(req.query.city) ? req.query.city : 'all');

// ---------- Button 1: WITHOUT cache (har baar MongoDB) ----------
app.get('/api/report/no-cache', wrap(async (req, res) => {
  const city = cityFrom(req);
  const { result, timeMs } = await timed(() => buildReport(city));
  res.json({ source: 'mongodb', cache: 'NONE', timeMs, data: result });
}));

// ---------- Button 2: WITH Redis cache ----------
app.get('/api/report/cache', wrap(async (req, res) => {
  const city = cityFrom(req);
  const { result, timeMs } = await timed(() => getReportWithCache(city));
  const source = result.cache === 'HIT' ? 'redis' : 'mongodb';
  res.json({ source, cache: result.cache, timeMs, data: result.data });
}));

// ---------- DB me write -> cache invalidation ----------
app.post('/api/students', wrap(async (req, res) => {
  const city = CITIES.includes(req.body.city) ? req.body.city : CITIES[0];
  const rollNo = (await Student.countDocuments()) + 1;
  const student = await Student.create(fakeStudent(rollNo, city));
  await invalidateReport(city);
  res.json({ added: student });
}));

// ---------- Redis ke andar kya pada hai ----------
app.get('/api/cache/keys', wrap(async (req, res) => {
  const keys = (await redis.keys('report:*')).sort();
  const items = await Promise.all(keys.map(async (key) => ({ key, ttl: await redis.ttl(key) })));
  res.json(items);
}));

app.delete('/api/cache', wrap(async (req, res) => {
  const keys = await redis.keys('report:*');
  if (keys.length) await redis.del(keys);
  res.json({ deleted: keys.length });
}));

// ---------- UI ke liye info ----------
app.get('/api/info', wrap(async (req, res) => {
  res.json({
    mode: PRACTICE ? 'practice' : 'solution',
    cacheFile: CACHE_FILE,
    totalStudents: await Student.estimatedDocumentCount(),
    cities: CITIES,
  });
}));

// Jo cache file abhi chal rahi hai uska code UI pe dikhane ke liye
app.get('/api/code', (req, res) => {
  res.type('text/plain').send(fs.readFileSync(path.join(__dirname, CACHE_FILE), 'utf8'));
});

app.use((err, req, res, next) => {
  console.error('❌', err.message);
  res.status(500).json({ error: err.message });
});

const PORT = Number(process.env.PORT) || 4000;

(async () => {
  try {
    await connectMongo();
    await connectRedis();
  } catch (err) {
    console.error('❌ Connect nahi ho paya:', err.message);
    console.error('   Check karo: MongoDB chal raha hai? WSL me `sudo service redis-server start` kiya?');
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}  (mode: ${PRACTICE ? 'PRACTICE' : 'SOLUTION'})`);
  });
})();
