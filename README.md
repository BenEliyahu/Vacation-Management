# Vacation Management App

Full-stack vacation request management system built with **Vue 3**, **Node.js/Express**, **TypeORM**, and **PostgreSQL**.

---

## Project Structure

```
vacation-management/
├── backend/          # Node.js + Express + TypeORM
│   ├── src/
│   │   ├── entities/         # TypeORM entities (User, VacationRequest)
│   │   ├── routes/           # REST API routes
│   │   ├── data-source.ts    # TypeORM DataSource config
│   │   └── index.ts          # Express app + server entry
│   ├── .env.example
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
└── frontend/         # Vue 3 + Vite + TypeScript
    ├── src/
    │   ├── api/              # Axios API client
    │   ├── router/           # Vue Router config
    │   ├── types/            # Shared TypeScript interfaces & enums
    │   └── views/            # HomeView, RequesterView, ValidatorView
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

## Prerequisites

- **Node.js** 18+
- A **PostgreSQL** database — either [Neon](https://neon.tech) (free, no local install) or a local PostgreSQL 14+ instance

---

## Setup & Run

### 1 — Database

**Option A — Neon (recommended)**

1. Sign up at [neon.tech](https://neon.tech) and create a new project.
2. Copy the connection string from the **Dashboard → Connection Details** panel.
3. You'll use it as `DATABASE_URL` in the next step.

> TypeORM `synchronize: true` auto-creates all tables on first run — no manual SQL needed.

**Option B — local PostgreSQL**

```sql
CREATE DATABASE vacation_management;
```

### 2 — Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Open .env and replace DATABASE_URL with your own Neon connection string.
# Free account at https://neon.tech — takes 2 minutes, no credit card needed.

# Start dev server (hot-reload)
npm run dev
```

The API will be available at **http://localhost:3000**.

### 3 — Seed demo users (one-time)

**Option A — via the UI:** open http://localhost:5173 and click the **"Seed demo users"** button at the bottom of the home page.

**Option B — via terminal:**

```bash
# macOS / Linux
curl -X POST http://localhost:3000/api/users/seed

# Windows (PowerShell)
Invoke-WebRequest -Uri "http://localhost:3000/api/users/seed" -Method POST
```

This creates 3 Requesters and 1 Validator.

### 4 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Running Tests

```bash
cd backend
npm test
# or with coverage:
npm run test:coverage
```

Tests use **Jest + Supertest** with mocked TypeORM repositories (no real database required).

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/users` | List all users |
| POST | `/api/users/seed` | Seed demo users |
| GET | `/api/vacations` | All requests (validator view) |
| GET | `/api/vacations?status=Pending` | Filtered by status |
| GET | `/api/vacations/user/:userId` | Requests by user |
| POST | `/api/vacations` | Submit a new request |
| PATCH | `/api/vacations/:id` | Approve or reject a request |

### POST /api/vacations — body

```json
{
  "userId": 1,
  "startDate": "2025-08-01",
  "endDate": "2025-08-05",
  "reason": "Summer holiday"
}
```

### PATCH /api/vacations/:id — body

```json
{ "status": "Approved" }
// or
{ "status": "Rejected", "comments": "Overlaps with team event" }
```

---

## Technical Decisions

| Choice | Reason |
|--------|--------|
| **Neon PostgreSQL** | Serverless PostgreSQL — no local install, free tier, full SQL compatibility |
| **TypeORM `synchronize: true`** | Convenient for dev — disable in production and use migrations |
| **Express-validator** | Declarative, chain-based validation close to the route handlers |
| **Vite proxy** | Avoids CORS issues in dev by forwarding `/api` calls to the backend |
| **Bootstrap 5 via CDN** | Zero build overhead; all standard admin-UI components available |
| **Vue 3 Composition API** | Explicit, co-located reactivity; easier to extract logic later |
| **Mocked TypeORM in tests** | Fast, deterministic unit tests without a test database |

---

## Known Limitations

- No authentication — user selection is done via the home screen picker.
- `synchronize: true` is for development only; production deployments should use migrations.
- No pagination on the validator dashboard.
- Tests cover the API layer only; no frontend component tests.
