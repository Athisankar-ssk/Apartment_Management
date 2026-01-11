# Copilot instructions — Apartment Management

Purpose: short, actionable guidance for AI coding agents working on this repo.

Big picture
- Two-service layout: `frontend/` (React Create React App) and `server/` (Express + Mongoose).
- Frontend runs on port 3000 (CRA) and calls backend at `http://localhost:5000/api/...` (see `frontend/src/pages/AdminLogin.jsx`).
- Backend is a small REST API that seeds a default admin (`server/createAdmin.js`), connects to MongoDB (`server/config/db.js`) and exposes routes under `/api` (notably `/api/admin/login` in `server/routes/adminRoutes.js`).

How to run (developer workflow)
- Backend (from `server/`):
  - Install: `npm install`
  - Provide a `.env` with at least `MONGO_URI` and `JWT_SECRET`.
  - Dev: `npm run dev` (uses `node --watch server.js`), Prod: `npm start`.
  - Server listens on port 5000 by default (`server/server.js`).
- Frontend (from `frontend/`):
  - Install: `npm install`
  - Dev: `npm start` (CRA on port 3000). See `frontend/README.md` for CRA notes.
- Typical local workflow: start the backend in one terminal, frontend in another. Backend must have DB access and `JWT_SECRET` set for login to work.

Project conventions & patterns
- Server uses ES modules (note `"type": "module"` in `server/package.json`) — use `import`/`export default` consistently.
- Routes follow `express.Router()` and are default-exported (see `server/routes/*.js`).
- Models use Mongoose and simple schemas (see `server/models/Admin.js`).
- Auth: admin login uses `bcryptjs` for password checks and issues a JWT via `jsonwebtoken`. Token payload contains `{ id: admin._id }` and expires in 1 day.
- Frontend stores auth in `localStorage` keys: `adminToken` and `adminName` (see `frontend/src/pages/AdminLogin.jsx` and `frontend/src/pages/Home.jsx`). UI gating is done client-side via presence of `adminToken`.
- Axios calls in this codebase are hardcoded to `http://localhost:5000` (see `AdminLogin.jsx`). If you change backend port or host, update those calls or centralize an env var like `REACT_APP_API_URL`.

Integration points & files to inspect first
- `server/server.js` — app boot, `createAdmin()` seed call, route mounting (`app.use('/api/admin', adminRoutes)`).
- `server/routes/adminRoutes.js` — login endpoint and token creation.
- `server/config/db.js` — MongoDB connection.
- `server/createAdmin.js` — seeding default admin (run at startup).
- `frontend/src/pages/AdminLogin.jsx` — axios POST to `http://localhost:5000/api/admin/login` and localStorage writes.
- `frontend/src/pages/Home.jsx` — checks `localStorage.adminToken` to show dashboard.

Quick code examples (copyable)
- Frontend login POST (from `frontend/src/pages/AdminLogin.jsx`):
```
axios.post('http://localhost:5000/api/admin/login', { email, password })
  .then(res => { localStorage.setItem('adminToken', res.data.token); localStorage.setItem('adminName', res.data.name); })
```
- Backend login route (from `server/routes/adminRoutes.js`):
```
router.post('/login', async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });
  // bcrypt.compare and jwt.sign => responds with { token, name }
});
```

Agent guidance / safe edits
- Preserve ES module syntax when editing backend files. If you convert to CommonJS, update `server/package.json` and imports across the server.
- Keep port and base-URL coordination in mind: changing backend listening port requires updating frontend axios calls or adding an env-driven base URL.
- When modifying auth, update `JWT_SECRET` expectations and tests (no tests exist in server currently).
- Seed admin data is created at startup via `createAdmin()` — be cautious when changing it to avoid overwriting production data.

Helpful commands summary
- Backend: `cd server && npm install && npm run dev` (requires `.env` with `MONGO_URI` and `JWT_SECRET`).
- Frontend: `cd frontend && npm install && npm start`.

What I could not infer
- No test harness for the server — assume manual testing. There are CRA test helpers in the frontend only.
- Exact expected `.env` keys beyond `MONGO_URI` and `JWT_SECRET` are not documented; inspect `server/config/db.js` and `server/server.js` when uncertain.

If anything here is unclear or you want more detail (e.g., expand examples, include how to run `createAdmin.js`, or add recommended env/example file), tell me which part to expand.
