// Ek card: button + time + HIT/MISS badge + pichhle results
const BADGE_TEXT = {
  NONE: 'har baar MongoDB',
  MISS: 'CACHE MISS · MongoDB se',
  HIT: 'CACHE HIT · Redis se',
};

export default function ReportCard({ title, buttonLabel, buttonClass, onClick, loading, runs }) {
  const last = runs[0];
  const avg = runs.length ? runs.reduce((sum, r) => sum + r.timeMs, 0) / runs.length : 0;

  return (
    <div className="card">
      <h2>{title}</h2>
      <button className={`big-btn ${buttonClass}`} onClick={onClick} disabled={loading}>
        {loading ? 'Loading…' : buttonLabel}
      </button>

      <div className="time">
        {last ? last.timeMs : '–'}
        <small> ms</small>
      </div>
      {last && <span className={`badge ${last.cache}`}>{BADGE_TEXT[last.cache]}</span>}

      <div className="history">
        {runs.map((r, i) => (
          <span key={i} className={`chip ${r.cache}`}>{r.timeMs} ms</span>
        ))}
      </div>
      {runs.length > 0 && (
        <div className="avg">Average (last {runs.length}): {avg.toFixed(2)} ms</div>
      )}
    </div>
  );
}
