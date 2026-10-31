# Redis Caching Demo

Ek hi report (50,000 students ka course-wise data + toppers) do tareeke se:

1. **Without Cache**: har request pe MongoDB poori collection scan karta hai (~50 ms)
2. **With Redis Cache**: pehli baar MongoDB (MISS), uske baad Redis se (HIT, ~0.5 ms)

## Project structure

```
redis-caching-demo/
├── backend/                 # Express API (port 4000)  ← isme kaam karna hai
│   ├── seed.js              # MongoDB me 50k dummy students daalta hai
│   ├── server.js            # Express routes (dono buttons ki APIs)
│   ├── src/
│   │   ├── db.js            # MongoDB + Redis connection, Student model
│   │   ├── report.js        # Heavy MongoDB aggregation (slow wala kaam)
│   │   ├── cache.js         # ⭐ Caching ka asli code (solution)
│   │   └── data.js          # Fake data banane ke helpers
│   ├── practice/
│   │   └── cache.js         # Same file, TODOs ke saath (students complete karenge)
│   └── public/index.html    # Purana plain HTML version (optional, localhost:4000 pe)
│
└── frontend/                # React + Vite (port 5173)  ← complete hai, change nahi karna
    └── src/
        ├── api.js           # Saari backend API calls ek jagah
        ├── App.jsx          # Poora page + state
        └── components/      # ReportCard, FlowDiagram, CacheKeys, ReportTable, CodeViewer
```

---

## Step 1: Redis install (Windows → WSL)

Redis officially Windows pe nahi chalta, isliye hum Windows ke andar Linux (Ubuntu) chalayenge, jise **WSL** kehte hain.

### 1.1 WSL install

**PowerShell ko "Run as Administrator"** se kholo (Start → PowerShell → right click → Run as administrator):

```powershell
wsl --install
```

- Install hone ke baad **computer restart** karo.
- Restart ke baad Ubuntu ki window khud khulegi. Ek **username** aur **password** banao.
- Password type karte waqt screen pe kuch nahi dikhega. Ye normal hai, type karke Enter dabao.

Check karo:

```powershell
wsl -l -v
```

`Ubuntu` ke aage `VERSION 2` dikhna chahiye.

### 1.2 Redis install (Ubuntu terminal me)

Start menu → **Ubuntu** kholo, phir:

```bash
sudo apt update
sudo apt install redis-server -y
sudo service redis-server start
redis-cli ping
```

`PONG` aaya = Redis chal raha hai ✅

> Har baar laptop restart ke baad Ubuntu kholke `sudo service redis-server start` chalana padega.

### 1.3 Windows se Redis dikh raha hai? (PowerShell me)

```powershell
Test-NetConnection 127.0.0.1 -Port 6379
```

`TcpTestSucceeded : True` aana chahiye.

---

## Step 2: Project chalao (VS Code me 2 terminal)

MongoDB pehle se chal raha hona chahiye (pagination wale project jaisa).

### Terminal 1: Backend

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm start
```

`🚀 http://localhost:4000 (mode: SOLUTION)` dikhna chahiye.

`.env` me apna MongoDB URL daal sakte ho (Atlas ho to wo URL). **`localhost` ki jagah `127.0.0.1` likho**, warna Node kabhi kabhi connect nahi kar pata.

### Terminal 2: Frontend

```bash
cd frontend
npm install
npm run dev
```

Browser me kholo: http://localhost:5173

### Practice mode (sirf backend restart karna hai)

Terminal 1 me Ctrl+C, phir:

```bash
npm run practice
```

Ab backend `backend/practice/cache.js` use karega (UI pe **PRACTICE mode** dikhega). Usme TODO 1–4 complete karo, backend restart karo, aur dekho "With Cache" ka time kaise girta hai. Frontend me kuch change nahi karna.

---

## Common problems

| Problem | Fix |
|---|---|
| `wsl --install` pe error `0x80370102` | BIOS me Virtualization (Intel VT-x / AMD SVM) ON karo |
| `wsl --install` sirf help dikha raha hai | WSL pehle se hai: `wsl --install -d Ubuntu` chalao |
| Kuch purana/atka hua lag raha hai | `wsl --update` phir `wsl --shutdown` aur Ubuntu dobara kholo |
| `ECONNREFUSED 127.0.0.1:6379` | Ubuntu me `sudo service redis-server start` |
| `ECONNREFUSED ::1:27017` | `.env` me `localhost` ki jagah `127.0.0.1` |
| UI pe "Backend se connect nahi hua" | Terminal 1 me backend chal raha hai? Port 4000 hai? (`frontend/src/api.js` me `API_URL`) |
| College PC pe admin access nahi | [Redis Cloud](https://redis.io/try-free/) ka free DB banao, `.env` me `REDIS_URL=redis://default:PASSWORD@HOST:PORT` |
