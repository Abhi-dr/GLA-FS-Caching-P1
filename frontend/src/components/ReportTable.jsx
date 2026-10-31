export default function ReportTable({ report }) {
  if (!report) {
    return (
      <div className="card">
        <h2>Report</h2>
        <div className="empty">Abhi koi report nahi</div>
      </div>
    );
  }

  const { data, source } = report;

  return (
    <div className="card">
      <h2>
        Report{' '}
        <span className="meta">
          · {data.city} · {data.totalStudents.toLocaleString('en-IN')} students · source: {source} · bana:{' '}
          {new Date(data.generatedAt).toLocaleTimeString()}
        </span>
      </h2>
      <table>
        <thead>
          <tr><th>Course</th><th>Students</th><th>Avg marks</th><th>Attendance</th></tr>
        </thead>
        <tbody>
          {data.byCourse.map((c) => (
            <tr key={c.course}>
              <td>{c.course}</td>
              <td className="num">{c.students}</td>
              <td className="num">{c.avgMarks}</td>
              <td className="num">{c.avgAttendance}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 16 }}>Top 5</h2>
      <table>
        <thead>
          <tr><th>Name</th><th>City</th><th>Course</th><th>Marks</th></tr>
        </thead>
        <tbody>
          {data.toppers.map((t) => (
            <tr key={t.rollNo}>
              <td>{t.name}</td>
              <td>{t.city}</td>
              <td>{t.course}</td>
              <td className="num">{t.marks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
