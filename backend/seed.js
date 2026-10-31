const mongoose = require('mongoose');
const { Student, connectMongo } = require('./src/db');
const { fakeStudent } = require('./src/data');

const TOTAL = Number(process.env.SEED_COUNT) || 50000;
const BATCH = 5000;

async function seed() {
  await connectMongo();

  await Student.deleteMany({});
  console.log('🧹 Purana data delete kar diya');

  for (let start = 1; start <= TOTAL; start += BATCH) {
    const batch = [];
    for (let i = start; i < start + BATCH && i <= TOTAL; i++) batch.push(fakeStudent(i));
    await Student.insertMany(batch);
    console.log(`📥 ${Math.min(start + BATCH - 1, TOTAL)} / ${TOTAL} students inserted`);
  }

  console.log(`✅ Done! ${TOTAL} students MongoDB me aa gaye`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
