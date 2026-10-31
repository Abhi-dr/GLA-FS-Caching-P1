const { Student } = require('./db');

// Ye hai hamari "heavy" query: 50,000 students scan karke
// course-wise report + top 5 toppers banati hai.
// Har baar ye poori collection padhti hai, isliye slow hai.
async function buildReport(city) {
  const match = city === 'all' ? {} : { city };

  const [result] = await Student.aggregate([
    { $match: match },
    {
      $facet: {
        byCourse: [
          {
            $group: {
              _id: '$course',
              students: { $sum: 1 },
              avgMarks: { $avg: '$marks' },
              avgAttendance: { $avg: '$attendance' },
              totalFees: { $sum: '$feesPaid' },
            },
          },
          { $sort: { avgMarks: -1 } },
        ],
        toppers: [
          { $sort: { marks: -1, attendance: -1 } },
          { $limit: 5 },
          { $project: { _id: 0, rollNo: 1, name: 1, city: 1, course: 1, marks: 1 } },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  return {
    city,
    totalStudents: result.total[0]?.count || 0,
    byCourse: result.byCourse.map((c) => ({
      course: c._id,
      students: c.students,
      avgMarks: Number(c.avgMarks.toFixed(2)),
      avgAttendance: Number(c.avgAttendance.toFixed(2)),
      totalFees: c.totalFees,
    })),
    toppers: result.toppers,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildReport };
