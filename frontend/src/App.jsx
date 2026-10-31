import { useEffect, useState } from 'react';
import * as api from './api';
import ReportCard from './components/ReportCard';
import FlowDiagram from './components/FlowDiagram';
import CacheKeys from './components/CacheKeys';
import ReportTable from './components/ReportTable';
import CodeViewer from './components/CodeViewer';

export default function App() {
  const [info, setInfo] = useState(null);
  const [code, setCode] = useState('');
  const [city, setCity] = useState('all');
  const [runs, setRuns] = useState({ noCache: [], cache: [] });
  const [lastCache, setLastCache] = useState(null); // NONE | MISS | HIT
  const [report, setReport] = useState(null);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadInfo() {
    setInfo(await api.getInfo());
  }

  async function loadKeys() {
    const list = await api.getCacheKeys();
    setKeys(list.map((k) => ({ key: k.key, expiresAt: Date.now() + k.ttl * 1000 })));
  }

  useEffect(() => {
    Promise.all([loadInfo(), loadKeys(), api.getCode().then(setCode)]).catch((e) =>
      setError(`Backend se connect nahi hua (${e.message}). Kya backend chal raha hai?`)
    );
  }, []);

  // which = 'noCache' ya 'cache'
  async function getReport(which) {
    setLoading(which);
    setError('');
    try {
      const fetcher = which === 'noCache' ? api.getReportNoCache : api.getReportWithCache;
      const res = await fetcher(city);

      setRuns((prev) => ({ ...prev, [which]: [res, ...prev[which]].slice(0, 12) }));
      setLastCache(res.cache);
      setReport({ data: res.data, source: res.source });
      await loadKeys();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  async function handleClear() {
    const res = await api.clearCache();
    setMessage(`${res.deleted} key(s) delete ho gayi. Ab agli request MISS hogi.`);
    await loadKeys();
  }

  async function handleAdd() {
    const target = city === 'all' ? 'Delhi' : city;
    const res = await api.addStudent(target);
    setMessage(`Naya student add hua: ${res.added.name} (${res.added.city}). Ab "With Cache" dabake dekho count badla ya nahi.`);
    await Promise.all([loadKeys(), loadInfo()]);
  }

  return (
    <>
      <header>
        <div>
          <h1>Redis Caching Demo</h1>
          <p className="sub">Same report, do tareeke se: har baar MongoDB vs pehle Redis se poochna</p>
        </div>
        {info && (
          <div>
            <span className="pill">{info.totalStudents.toLocaleString('en-IN')} students</span>{' '}
            <span className={`pill ${info.mode}`}>{info.mode === 'practice' ? 'PRACTICE mode' : 'SOLUTION mode'}</span>
          </div>
        )}
      </header>

      {error && <div className="error">{error}</div>}

      <div className="toolbar">
        <label>
          City:{' '}
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="all">All cities</option>
            {info?.cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <span className="meta">
          Har city ki apni Redis key banti hai, jaise <code>report:Delhi</code>
        </span>
      </div>

      <div className="grid2">
        <ReportCard
          title="1. Without Cache"
          buttonLabel="Get Report (seedha MongoDB)"
          buttonClass="btn-mongo"
          onClick={() => getReport('noCache')}
          loading={loading === 'noCache'}
          runs={runs.noCache}
        />
        <ReportCard
          title="2. With Redis Cache"
          buttonLabel="Get Report (Redis cache)"
          buttonClass="btn-redis"
          onClick={() => getReport('cache')}
          loading={loading === 'cache'}
          runs={runs.cache}
        />
      </div>

      <FlowDiagram cache={lastCache} />

      <div className="grid2 section">
        <CacheKeys keys={keys} onClear={handleClear} onAdd={handleAdd} message={message} />
        <ReportTable report={report} />
      </div>

      <CodeViewer file={info?.cacheFile} code={code} />
    </>
  );
}
