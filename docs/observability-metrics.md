# Observability Metrics

## Queue Metrics

### Waiting Jobs
Measures jobs waiting in the BullMQ queue before assignment.
Why it matters: shows backlog pressure.
Expected values: low under normal load, rising under traffic spikes.

### Active Jobs
Measures jobs currently being processed by workers.
Why it matters: shows worker saturation.
Expected values: should generally track configured concurrency.

### Completed Jobs
Measures successfully processed jobs.
Why it matters: indicates throughput and system health.
Expected values: should steadily increase.

### Failed Jobs
Measures jobs that failed after retry exhaustion or unrecoverable errors.
Why it matters: highlights functional failures and downstream instability.
Expected values: ideally near zero.

### Delayed Jobs
Measures jobs waiting for retry backoff or future scheduling.
Why it matters: shows retry pressure and queued recovery work.
Expected values: short-lived spikes are normal.

## Worker Metrics

### Active Workers
Measures workers currently marked busy.
Why it matters: shows real processing load.
Expected values: rises with traffic.

### Jobs Processed
Measures total jobs completed by workers.
Why it matters: shows throughput over time.
Expected values: should increase steadily.

### Average Processing Time
Measures mean time spent processing jobs.
Why it matters: shows job complexity and worker efficiency.
Expected values: workload-dependent.

### Worker Utilization
Measures how much worker capacity is being used.
Why it matters: helps decide when to add workers or concurrency.
Expected values: moderate to high during load, not pinned at 100% for long periods.

## API Metrics

### Requests/sec
Measures request throughput over the last rolling minute.
Why it matters: shows API traffic volume.
Expected values: varies by workload.

### Average Response Time
Measures average API latency.
Why it matters: shows request handling cost.
Expected values: should stay low and stable.

### Error Rate
Measures percentage of requests that return errors.
Why it matters: surfaces API reliability issues.
Expected values: should remain low.