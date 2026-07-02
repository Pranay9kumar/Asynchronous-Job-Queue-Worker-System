# Observability Architecture

```text
Client
  |
  v
Express API
  |
  +--> Logger
  +--> Metrics
  +--> Health Checks
  +--> Alerts
  |
  v
BullMQ
  |
  v
Workers
  |
  v
MongoDB
```

Monitoring layer behavior:

- Logger captures request and job lifecycle events.
- Metrics aggregates queue, worker, API, and performance signals.
- Health checks validate Redis, MongoDB, queue, and worker availability.
- Alerts fire when DLQ growth, failure rate, or worker availability crosses thresholds.