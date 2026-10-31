import { useEffect, useState } from 'react';

// Redis me abhi kaunsi keys hain aur kitne second me expire hongi.
// Keys sirf button dabane pe backend se aati hain (taaki `redis-cli MONITOR`
// me faltu commands na dikhein). TTL ka countdown yahin browser me chalta hai.
export default function CacheKeys({ keys, onClear, onAdd, message }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const alive = keys.filter((k) => k.expiresAt > now);

  return (
    <div className="card">
      <h2>Redis ke andar abhi kya hai</h2>
      <div className="keys">
        {alive.length === 0 && <div className="empty">Koi key nahi (cache khaali hai)</div>}
        {alive.map((k) => (
          <div key={k.key}>
            <span>{k.key}</span>
            <span>TTL {Math.ceil((k.expiresAt - now) / 1000)}s</span>
          </div>
        ))}
      </div>
      <div className="toolbar" style={{ margin: '14px 0 0' }}>
        <button onClick={onClear}>Clear Cache</button>
        <button onClick={onAdd}>+ Add Student (DB write)</button>
      </div>
      <div className="toast">{message}</div>
    </div>
  );
}
