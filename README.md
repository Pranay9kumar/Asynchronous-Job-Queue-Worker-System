# Asynchronous Job Queue and Worker System

Production-grade asynchronous job processing platform built with Node.js, Express, Redis, BullMQ, MongoDB, and a React + Vite dashboard.

## Project Overview

This system accepts jobs through an API, persists metadata in MongoDB, queues work with BullMQ, processes jobs in worker processes, and exposes operational data through metrics, health checks, alerts, and a dashboard.

## Features

- Job submission and job lookup APIs
- BullMQ queue and worker processing
- Retry mechanism with exponential backoff
- Dead Letter Queue (DLQ)
- Idempotency and duplicate request protection
- Rate limiting
- Worker tracking and metrics
- API, queue, and worker observability
- Health checks and alert APIs
- Swagger/OpenAPI documentation
- Modern React dashboard with charts
- Docker Compose for one-command startup

## Architecture Diagram

```text
Client
  |
  v
Express API
  |
  +--> Validation, Rate Limiting, Idempotency
  +--> Metrics, Logs, Health, Alerts
  |
  v
BullMQ Queue
  |
  v
Workers
  |
  v
MongoDB
  |
  +--> Job State
  +--> Worker State
  +--> Alerts
  +--> Metrics Snapshots
```

## Folder Structure

```text
src/
  config/
  controllers/
  docs/
  middlewares/
  models/
  queues/
  routes/
  scripts/
  services/
  workers/
frontend/
  src/
    components/
    hooks/
    lib/
    pages/
    styles.css
```

## Technologies Used

Backend:
- Node.js
- Express
- BullMQ
- Redis
- MongoDB
- Pino
- Swagger UI
- Helmet
- CORS

Frontend:
- React
- Vite
- JavaScript
- Axios
- React Router
- Chart.js
- Plain CSS

## Installation

### Backend

```bash
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Environment Variables

Copy the example files:

```bash
cp .env.example .env.development
cp .env.example .env.production
```

Update values as needed for local or production use.

## Docker Setup

Start everything with Docker Compose:

```bash
docker compose up --build
```

Services:
- API on `http://localhost:3000`
- Frontend on `http://localhost:8080`
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`

## API Documentation

Swagger/OpenAPI is available at:

- `GET /api-docs`

Useful endpoints:
- `POST /jobs`
- `GET /jobs/:id`
- `GET /dlq`
- `POST /dlq/:id/retry`
- `DELETE /dlq/:id`
- `GET /workers`
- `GET /metrics`
- `GET /metrics/jobs`
- `GET /metrics/workers`
- `GET /health`
- `GET /admin/jobs`
- `GET /admin/workers`
- `GET /admin/alerts`
- `GET /admin/statistics`

## Screenshots

Add screenshots here when ready:

- Dashboard screenshot
- Job submission screen
- Job details timeline
- DLQ table
- Worker overview
- Metrics charts
- Alerts page

## Future Improvements

- Authentication and authorization
- Role-based admin access
- Multi-region deployment
- Kubernetes orchestration
- Persistent logging pipeline
- Centralized tracing
- Retention policies for history and alerts
