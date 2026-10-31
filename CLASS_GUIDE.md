# Class Guide: Redis Caching (Teacher ke liye)

Total time: ~90 min. Har part me **🗣️ Bolna hai** = class me kya bolna hai, **💻 Karwana hai** = students se kya chalwana hai.

---

## Part 0: Pagination se connect karo (5 min)

🗣️ **Bolna hai:**
> "Pichli class me pagination kiya tha. Usne ye problem solve ki ki **ek baar me kitna data** laana hai: 50,000 ki jagah sirf 10.
> Aaj ek alag problem hai: **kitni baar** DB tak jaana hai.
> Socho college ki website pe ek 'Dashboard' hai: kaunsa course top pe hai, average marks, toppers.
> 1,000 students ek saath homepage kholte hain. Har request pe MongoDB 50,000 records padh ke wahi same report banata hai. **1,000 baar same kaam, same answer.** Ye waste hai."

**Analogy (board pe likho):**
> Library (MongoDB) me saari books hain, lekin wahan jaake dhoondhna slow hai.
> Tumhari table pe ek notebook (Redis) hai, jisme jo cheez baar baar chahiye wo likh li.
> Pehli baar library jaana padega, uske baad notebook se turant.

| | MongoDB | Redis |
|---|---|---|
| Data kahan | Disk (SSD/HDD) | RAM |
| Speed | milliseconds (10–100+ ms) | microseconds (< 1 ms) |
| Size | Bahut bada | RAM jitna (chhota, mehenga) |
| Kaam | Permanent data ka ghar | Baar baar chahiye wala data ka shortcut |

---

## Part 1: Redis kya hai (5 min)

🗣️ **Bolna hai:**
> "Redis ek **in-memory key-value store** hai. Bas ek bada sa JavaScript object samjho jo RAM me rehta hai aur network pe accessible hai.
> `key → value`. Jaise `report:Delhi → { ...report ka JSON... }`.
> Iski khaas baat: har key pe **expiry (TTL)** laga sakte ho. 60 second baad key khud delete ho jaati hai."

Real examples bolo: OTP (5 min expiry), login session, Instagram ka like count, YouTube views, leaderboard, rate limiting.

---

## Part 2: Hands-on install (20 min)

💻 **Karwana hai:** README ka Step 1 follow karwao. Projector pe khud karte jao.

**PowerShell (Run as Administrator):**

```powershell
wsl --install
```

🗣️ "Ye Windows ke andar ek asli Linux (Ubuntu) install kar raha hai. Production me Redis Linux pe hi chalta hai, isliye hum bhi Linux pe chalayenge."

Restart → Ubuntu me username/password. ⚠️ Pehle hi bol do: **"Password type karoge to kuch dikhega nahi, ye bug nahi hai."**

**Ubuntu terminal:**

```bash
sudo apt update
sudo apt install redis-server -y
sudo service redis-server start
redis-cli ping
```

🗣️ "`apt` Ubuntu ka npm samjho. `sudo` matlab admin permission. `PONG` aaya matlab Redis zinda hai."

> **Tip:** Jinka WSL atak jaaye unhe ek bande ke saath bitha do. Admin access nahi hai to Redis Cloud free wala fallback (README ke end me).

---

## Part 3: redis-cli playground (10 min)

💻 **Ubuntu me:**

```bash
redis-cli
```

Ab ye commands ek ek karke chalwao, har ek ke baad pucho "kya aaya?":

```
SET name "Rahul"
GET name
GET age
```

🗣️ "`GET age` ne `(nil)` diya, matlab key hai hi nahi. Isi ko **cache MISS** kehte hain. `GET name` mila = **cache HIT**."

```
SET otp 4567 EX 20
TTL otp
```

🗣️ "`EX 20` = 20 second me expire. `TTL` bata raha hai kitne second bache. 20 second ruko…"

```
GET otp
```

🗣️ "Gayab! Isi tarah OTP expire hota hai. Koi cron job nahi, Redis khud delete karta hai."

```
KEYS *
DEL name
KEYS *
exit
```

---

## Part 4: Project demo (15 min)

🗣️ **Pehle structure dikhao (VS Code me dono folder):**
> "Do folder hain. `frontend` React me hai aur **poora complete hai, isme hum kuch change nahi karenge.** Isme sirf do button hain jo backend ki do APIs call karte hain (`frontend/src/api.js` dikhao).
> Asli kaam `backend` me hai. Wahan `/api/report/no-cache` aur `/api/report/cache` do APIs hain. Aaj hum doosri wali API ko fast banayenge."

💻 **Terminal 1 (backend):**

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm start
```

💻 **Terminal 2 (frontend):**

```bash
cd frontend
npm install
npm run dev
```

Browser: http://localhost:5173

**Ek doosra Ubuntu terminal kholo aur ye chalao (projector pe dikhna chahiye):**

```bash
redis-cli MONITOR
```

🗣️ "Ye Redis ka live CCTV hai. Server Redis ko jo bhi command bhejega, yahan dikhega."

> Note: Har click ke baad ek `KEYS report:*` aur `TTL` bhi dikhega. Wo UI ke "Redis ke andar" panel ke liye hai, caching ka part nahi. Asli kaam `GET` aur `SET` hai.

### Demo sequence

1. **"Without Cache" 4–5 baar dabao.**
   🗣️ "Har baar ~50 ms. MONITOR me kuch nahi aaya, kyunki Redis ko poocha hi nahi."
   (Agar koi pooche pehli baar zyada time kyun: "MongoDB ka bhi apna internal cache hai, pehli baar disk se padha, phir RAM me rakh liya. Caching har jagah hai!")

2. **Pucho:** "Ab 'With Cache' dabaunga, kitna time lagega?" Prediction lo.

3. **"With Cache" pehli baar dabao** → MISS, ~50 ms.
   🗣️ "Arey, same time! Kyunki pehli baar Redis khaali tha. MONITOR dekho: `GET report:all` → kuch nahi mila, phir `SET report:all ... EX 60`. Ab Redis ke paas copy hai."

4. **"With Cache" dobara dabao** → HIT, ~0.5 ms.
   🗣️ "**50 ms se 0.5 ms. Lagbhag 100 guna fast.** MONITOR me sirf ek `GET` aaya. MongoDB ko chhua bhi nahi. Flow diagram dekho, MongoDB grey ho gaya."

5. **City change karo (Delhi)** → MISS, phir HIT.
   🗣️ "Har city ki alag key: `report:Delhi`. Cache key design karna bhi system design ka part hai: key me wo sab hona chahiye jisse answer badalta hai."

6. **"Redis ke andar" panel dikhao**, TTL ghat raha hai. 60 sec baad key gayab → agli request phir MISS.

7. Ubuntu me data khud dekhao:

```bash
redis-cli GET report:Delhi
redis-cli TTL report:Delhi
```

🗣️ "Redis sirf string rakhta hai. Isliye JSON object ko `JSON.stringify` karke rakha hai."

---

## Part 5: Code walkthrough (10 min)

UI ke neeche "Ye caching kaise implement hui?" box me ya VS Code me `backend/src/cache.js` kholo.

```js
async function getReportWithCache(city) {
  const key = `report:${city}`;

  const cached = await redis.get(key);              // 1. Redis se poocho
  if (cached) {
    return { cache: 'HIT', data: JSON.parse(cached) };
  }

  const data = await buildReport(city);             // 2. MongoDB se lao

  await redis.set(key, JSON.stringify(data), { EX: TTL }); // 3. Redis me rakh do

  return { cache: 'MISS', data };
}
```

🗣️ **Bolna hai:**
> "Is pattern ka naam hai **Cache-Aside** (ya Lazy Loading). Interview me naam yaad rakhna.
> Teen step: **Check → Miss pe DB → Save.**
> App khud decide kar raha hai ki cache kab bharna hai. Redis ko MongoDB ke baare me kuch nahi pata."

Board pe diagram:

```
Request → Redis me hai?
            ├── Haan (HIT)  → return  ⚡
            └── Nahi (MISS) → MongoDB → Redis me SET (EX 60) → return
```

Compare karo `backend/server.js` me dono routes: `/no-cache` seedha `buildReport()` bulata hai, `/cache` `getReportWithCache()` bulata hai. **Baaki sab same.**

🗣️ "Dhyan do: frontend ko pata bhi nahi ki Redis hai. Wo bas API call karta hai. Caching poori tarah **backend ka kaam** hai. Isliye frontend me ek line nahi badli."

---

## Part 6: Students khud likhenge (15 min)

💻 **Sirf Terminal 1 (backend)** band karo (Ctrl+C), phir. Frontend chalta rehne do:

```bash
npm run practice
```

Browser refresh karo. UI pe **PRACTICE mode** dikhega. Abhi "With Cache" bhi har baar MISS aur slow hai.

🗣️ "`backend/practice/cache.js` kholo. TODO 1, 2, 3 complete karo. Save karke backend restart karo aur jab tak HIT na dikhe, rukna mat."

Jo jaldi kar le unse MONITOR me apna `GET`/`SET` dikhwao.

---

## Part 7: Stale data aur Cache Invalidation (10 min)

Abhi bhi **practice mode** me, TODO 4 **khaali** rehne do.

1. City = Delhi, "With Cache" dabao (HIT). Total students note karo.
2. **"+ Add Student"** dabao (MongoDB me naya student gaya).
3. "With Cache" phir dabao → HIT, lekin **count wahi purana!**

🗣️ **Bolna hai:**
> "DB me 1 student badh gaya, lekin report purani dikha rahi hai. Isse kehte hain **stale data**.
> Cache fast hai, lekin **jhooth bol sakta hai**.
> Computer science ka famous joke hai: do hi mushkil kaam hain: cache invalidation aur naming things."

Do solution:
- **TTL** (jo already hai): 60 sec baad khud theek ho jayega. Simple, lekin 60 sec tak galat data.
- **Invalidation**: jab bhi DB me write ho, related cache key delete kar do.

💻 Ab TODO 4 karwao:

```js
await redis.del([`report:${city}`, 'report:all']);
```

🗣️ "Delhi ka student aaya to `report:Delhi` bhi galat aur `report:all` bhi galat. Dono uda do. Agli request MISS hogi aur fresh data aayega."

Restart karke same steps dobara → ab count turant badhta hai ✅

---

## Part 8: System design wrap-up (5 min)

🗣️ **Cache kab lagao:**
- Data **baar baar padha** jaata hai, **kam badalta** hai (read-heavy)
- Query/computation **expensive** hai (aggregation, external API call)
- Thoda purana data chalega (dashboard, product list, trending posts)

🗣️ **Kab mat lagao:**
- Bank balance, payment status: har baar sahi data chahiye
- Data har second badalta hai: cache bharte hi purana
- Har user ka alag data jo kabhi dobara nahi padha jayega

🗣️ **Interview questions (board pe likh do):**
1. Cache-aside pattern kya hai? (Check → Miss pe DB → Save)
2. TTL kya hai aur kitna rakhoge? (Kitna purana data chal sakta hai, utna)
3. Cache invalidation kaise karoge? (Write pe key delete)
4. Redis full ho gaya to? (Eviction: `maxmemory-policy allkeys-lru`, sabse kam use hui key hatao)
5. Redis down ho gaya to? (App ko seedha DB se chalna chahiye, cache sirf speed ke liye hai, data ka ghar nahi)
6. 1 lakh users ek saath aaye aur key abhi expire hui to? (Sab MISS → DB pe toot pade = **Cache Stampede**. Homework me padh ke aana.)

---

## Homework

1. Ek naya route banao: `GET /api/students/:rollNo` jo single student ko cache kare (key: `student:50001`).
2. Pagination wale project me page wise caching lagao: key `students:page:3:limit:10`. Socho: naya student aaya to kaun kaun si keys invalidate karoge?
3. "Cache stampede" padh ke 3 line me likh ke laao.

---

## Quick reference: saari commands

**Windows PowerShell (Admin)**
```powershell
wsl --install
wsl -l -v
wsl --update
wsl --shutdown
Test-NetConnection 127.0.0.1 -Port 6379
```

**Ubuntu**
```bash
sudo apt update
sudo apt install redis-server -y
sudo service redis-server start
sudo service redis-server status
redis-cli ping
redis-cli MONITOR
redis-cli KEYS "report:*"
redis-cli GET report:all
redis-cli TTL report:all
redis-cli INFO stats | grep keyspace
redis-cli FLUSHALL
```

**Backend (Terminal 1)**
```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm start
npm run practice
```

**Frontend (Terminal 2)**
```bash
cd frontend
npm install
npm run dev
```
