# Vacation Management App

A full-stack web application for managing employee vacation requests.  
Employees submit requests, managers approve or reject them — all in one clean interface.

**Built with:** Vue 3 · Node.js · Express · TypeORM · PostgreSQL (Neon)

---

## What it does

| Interface | Who uses it | What they can do |
|-----------|-------------|-----------------|
| **Requester** | Employee | Submit vacation requests, view their history and status |
| **Validator** | Manager | View all requests, filter by status, approve or reject with a comment |

---

## Quick Start

> You'll need **Node.js 18+** installed. That's it — no local database required.

### Step 1 — Get a free database (2 minutes)

This project uses [Neon](https://neon.tech) — a free serverless PostgreSQL service. No installation needed.

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Click **"New Project"** and give it any name
3. On the dashboard, find **"Connection string"** — it looks like this:
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```
4. Copy it — you'll need it in the next step

### Step 2 — Set up the backend

```bash
cd backend
npm install
```

Create a file called `.env` inside the `backend/` folder with this content:

```
PORT=3000
DATABASE_URL=paste-your-neon-connection-string-here
```

Then start the server:

```bash
npm run dev
```

You should see:
```
Database connected
Server running on http://localhost:3000
```

> The tables are created automatically on first run — no SQL needed.

### Step 3 — Set up the frontend

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at **http://localhost:5173**

### Step 4 — Load demo users (one time only)

On the home page, scroll to the bottom and click **"Seed demo users"**.

This creates:
- Alice Martin, Bob Johnson, Carol White — as **Requesters**
- David Manager — as **Validator**

---

## Running Tests

Tests use mocked repositories — no database connection needed.

```bash
cd backend
npm test
```

Expected output: **13 tests passing**

```bash
# With coverage report:
npm run test:coverage
```

---

## Project Structure

```
vacation-management/
├── backend/
│   ├── src/
│   │   ├── entities/        # TypeORM models: User, VacationRequest
│   │   ├── routes/          # REST API: users, vacations
│   │   ├── middleware/      # Global error handler
│   │   ├── data-source.ts   # Database connection (Neon or local)
│   │   └── index.ts         # Express app entry point
│   ├── .env.example         # Environment variable template
│   └── package.json
└── frontend/
    └── src/
        ├── api/             # Axios API client
        ├── composables/     # useToast, useDateFormat
        ├── router/          # Vue Router routes
        ├── types/           # Shared TypeScript interfaces & enums
        └── views/           # HomeView, RequesterView, ValidatorView
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get a single user |
| POST | `/api/users/seed` | Create demo users |
| GET | `/api/vacations` | All requests (validator view) |
| GET | `/api/vacations?status=Pending` | Filter by status |
| GET | `/api/vacations/user/:userId` | Requests by user |
| POST | `/api/vacations` | Submit a new request |
| PATCH | `/api/vacations/:id` | Approve or reject a request |

---

## Technical Decisions

| Choice | Why |
|--------|-----|
| **Neon PostgreSQL** | Free serverless PostgreSQL — no local install, full SQL compatibility |
| **TypeORM** | Decorator-based ORM that maps cleanly to the entity schema |
| **`synchronize: true`** | Auto-creates tables in dev — in production this would be replaced with migrations |
| **express-validator** | Declarative validation chained directly to each route |
| **Vite proxy** | Forwards `/api` calls to the backend in dev, avoiding CORS issues |
| **Bootstrap 5 via CDN** | Zero build overhead, full admin UI component set |
| **Vue 3 Composition API** | Co-located reactive logic, easy to extract into composables |
| **Mocked TypeORM in tests** | Fast deterministic tests with no real database dependency |

---

## Known Limitations

- No authentication — users are selected from the home screen picker
- `synchronize: true` is for development only; production should use migrations
- No pagination on the validator dashboard
- Tests cover the API layer only — no frontend component tests
