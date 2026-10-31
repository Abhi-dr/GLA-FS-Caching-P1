// Backend me abhi jo cache file chal rahi hai, uska code
export default function CodeViewer({ file, code }) {
  return (
    <div className="card section">
      <h2>
        Ye caching kaise implement hui? <span className="meta">(backend/{file?.replace('./', '')})</span>
      </h2>
      <pre>{code || 'loading…'}</pre>
    </div>
  );
}
