# Observability Notes

Observability is different from debugging because it is designed to answer unknown operational questions from the outside of the system. Debugging usually starts after you already know something is broken. Observability helps you discover that something is broken in the first place.

Logs, metrics, and monitoring solve different problems:

- Logs explain what happened to a specific request, job, or worker.
- Metrics summarize system behavior over time.
- Monitoring uses those signals to detect abnormal conditions and trigger action.

Production engineers usually detect issues by watching error rates, latency, queue buildup, worker saturation, and health degradation. They then drill into logs and admin APIs to identify the specific failing component.

These metrics help scale the system by showing when to add workers, increase concurrency, or investigate queue pressure, slow processing, or rising failure rates.