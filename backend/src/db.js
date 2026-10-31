require('dotenv').config();
const mongoose = require('mongoose');
const { createClient } = require('redis');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/redis_demo';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// ---------- MongoDB ----------
const studentSchema = new mongoose.Schema({
  rollNo: Number,
  name: String,
  email: String,
  city: String,
  course: String,
  year: Number,
  marks: Number,
  attendance: Number,
  feesPaid: Number,
});
const Student = mongoose.model('Student', studentSchema);

async function connectMongo() {
  await mongoose.connect(MONGO_URL);
  console.log('✅ MongoDB connected:', MONGO_URL);
}

// ---------- Redis ----------
const redis = createClient({ url: REDIS_URL });
redis.on('error', (err) => console.error('❌ Redis error:', err.message));

async function connectRedis() {
  await redis.connect();
  console.log('✅ Redis connected:', REDIS_URL);
}

module.exports = { Student, redis, connectMongo, connectRedis };
