# Orderbook Monorepo

IF Docker Available, Goto #ForkastAssignment directory docker-compuse --build command would start fullstack (DB, API, UI) 

Otherwise - follow below instructions.

This repository contains a separate backend (Express + Postgres) and frontend (Next.js) for the Orderbook project.

## Structure
- backend/ - Express API (runs on port 3000)
- frontend/ - Next.js UI (runs on port 8000)

## Quickstart (development)
1. Start Postgres and create DB (or use Docker).
2. Backend:
   - cd backend
   - npm install
   - copy .env.example to .env and edit
   - run migrations: npm run migrate
   - start: npm run start
3. Frontend:
   - cd frontend
   - npm install
   - copy .env.local.example to .env.local if you need to change BACKEND URL
   - start: npm run dev (opens on http://localhost:8000)

## Notes
- Frontend calls backend at NEXT_PUBLIC_BACKEND_URL (default http://localhost:8000).
- For convenience I did not include Docker compose in this bundle; I can add it if you want a one-command setup.
