# PayFlow — Payment Processing Platform

A full-stack fintech payment simulation platform built with Go and Next.js, demonstrating real-world payment system engineering concepts used in production financial systems.

## Tech Stack

**Backend:** Go, Gin, PostgreSQL, Redis, JWT, Docker  
**Frontend:** Next.js, Tailwind CSS, Axios

## Features

- JWT-based authentication with bcrypt password hashing
- ACID-compliant transaction processing with automatic rollback
- Real-time fraud detection engine with 4 rules:
  - Amount threshold blocking (>₹50,000)
  - Velocity limiting via Redis (5 transactions/60s)
  - Insufficient balance rejection
  - Large transaction flagging (₹10k–₹50k)
- Admin dashboard with user management and fraud monitoring
- Fully containerized with Docker Compose

## Quick Start
```bash
# Clone the repo
git clone https://github.com/Vydeh07/payflow
cd payflow

# Start everything with one command
docker-compose up --build

# Frontend
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:8080`  
Frontend runs on `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login + get JWT |
| GET | /api/balance | Yes | Get balance |
| POST | /api/transactions/send | Yes | Send money |
| GET | /api/transactions/history | Yes | Transaction history |
| GET | /api/admin/stats | Yes | Platform stats |
| GET | /api/admin/users | Yes | All users |
| GET | /api/admin/flagged | Yes | Flagged transactions |

## Architecture
```
React Frontend → Go API Server → PostgreSQL
                      ↓
               Fraud Engine → Redis (rate limiting)
```
