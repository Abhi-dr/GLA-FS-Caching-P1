// Seed aur server dono yahi lists use karte hain
const CITIES = ['Delhi', 'Mumbai', 'Jaipur', 'Lucknow', 'Pune', 'Bengaluru', 'Indore', 'Kolkata', 'Chennai', 'Hyderabad'];
const COURSES = ['B.Tech CSE', 'B.Tech ECE', 'BCA', 'MCA', 'B.Sc IT', 'MBA', 'B.Com', 'BBA'];
const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Rohan', 'Karan', 'Ishaan', 'Arjun', 'Rahul', 'Ananya', 'Diya', 'Priya', 'Sneha', 'Kavya', 'Riya', 'Neha', 'Pooja', 'Aman', 'Yash', 'Simran', 'Tanvi'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Jain', 'Agarwal', 'Mehta', 'Yadav', 'Khan', 'Reddy', 'Iyer', 'Das', 'Joshi', 'Mishra'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function fakeStudent(i, city) {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  return {
    rollNo: i,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@college.edu`,
    city: city || pick(CITIES),
    course: pick(COURSES),
    year: randInt(1, 4),
    marks: randInt(35, 100),
    attendance: randInt(50, 100),
    feesPaid: randInt(40, 150) * 1000,
  };
}

module.exports = { CITIES, COURSES, fakeStudent };
