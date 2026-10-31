// Request kis raste se gayi: Browser -> Express -> Redis -> MongoDB
const TEXT = {
  NONE: 'Redis ko skip kiya, seedha MongoDB ne 50k documents scan kiye.',
  HIT: 'CACHE HIT: Redis ke paas data tha. MongoDB ko chhua bhi nahi.',
  MISS: 'CACHE MISS: Redis khaali tha, MongoDB se laaye aur Redis me SET kar diya (agli baar HIT hoga).',
};

export default function FlowDiagram({ cache }) {
  const redisClass = cache === 'NONE' ? 'off' : cache === 'HIT' ? 'on-redis' : cache === 'MISS' ? 'miss' : '';
  const mongoClass = cache === 'HIT' ? 'off' : cache ? 'on-mongo' : '';
  const active = cache ? 'on-app' : '';

  return (
    <div className="card section">
      <h2>Request kahan se hoke aayi?</h2>
      <div className="flow">
        <div className={`node ${active}`}><b>Browser</b><span>React app</span></div>
        <div className={`arrow ${cache ? 'on' : ''}`} />
        <div className={`node ${active}`}><b>Node / Express</b><span>server.js</span></div>
        <div className={`arrow ${cache ? 'on' : ''}`} />
        <div className={`node ${redisClass}`}><b>Redis</b><span>RAM · key-value</span></div>
        <div className={`arrow ${cache === 'HIT' ? 'off' : cache ? 'on' : ''}`} />
        <div className={`node ${mongoClass}`}><b>MongoDB</b><span>disk · 50k docs scan</span></div>
      </div>
      <div className="flow-text">{cache ? TEXT[cache] : 'Koi button dabao…'}</div>
    </div>
  );
}
