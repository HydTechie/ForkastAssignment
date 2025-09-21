# Orderbook Backend (Express + Postgres)

This is the backend API for the Orderbook project.

## Quick start (backend)

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a Postgres database and copy `.env.example` to `.env` and update values.

3. Run migrations:
```bash
npm run migrate
# you will be prompted for the DB password (or use PGPASSWORD env var)
```

4. Start the app:
```bash
npm run start
```

API endpoints (default base: http://localhost:3000/api)
- POST /orders/buy
- POST /orders/sell
- GET /orderbook
- GET /trades
