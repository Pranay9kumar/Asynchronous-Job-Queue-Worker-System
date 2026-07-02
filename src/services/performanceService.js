const { JobModel } = require('../models/jobModel');
const { MetricSnapshotModel } = require('../models/metricSnapshotModel');

async function recordJobPerformance(job, processedAt = new Date()) {
  const finishedAt = processedAt.getTime();
  const processedOn = job.processedOn || finishedAt;
  const timestamp = job.timestamp || finishedAt;
  const queueTimeMs = Math.max(processedOn - timestamp, 0);
  const processingTimeMs = Math.max(finishedAt - processedOn, 0);
  const endToEndCompletionTimeMs = Math.max(finishedAt - timestamp, 0);

  await JobModel.updateOne(
    { jobId: job.data.jobId },
    {
      $set: {
        queueTimeMs,
        processingTimeMs,
        endToEndCompletionTimeMs,
        performanceRecordedAt: processedAt
      }
    }
  );

  await MetricSnapshotModel.create({
    type: 'JOB_PERFORMANCE',
    payload: {
      jobId: job.data.jobId,
      queueTimeMs,
      processingTimeMs,
      endToEndCompletionTimeMs,
      processedAt: processedAt.toISOString()
    }
  }).catch(() => undefined);

  return {
    queueTimeMs,
    processingTimeMs,
    endToEndCompletionTimeMs
  };
}

async function getPerformanceStatistics() {
  const stats = await JobModel.aggregate([
    {
      $group: {
        _id: null,
        avgQueueTimeMs: { $avg: '$queueTimeMs' },
        avgProcessingTimeMs: { $avg: '$processingTimeMs' },
        avgEndToEndCompletionTimeMs: { $avg: '$endToEndCompletionTimeMs' },
        totalJobs: { $sum: 1 }
      }
    }
  ]);

  const result = stats[0] || {};

  return {
    averageQueueTimeMs: Number((result.avgQueueTimeMs || 0).toFixed(2)),
    averageProcessingTimeMs: Number((result.avgProcessingTimeMs || 0).toFixed(2)),
    averageEndToEndCompletionTimeMs: Number((result.avgEndToEndCompletionTimeMs || 0).toFixed(2)),
    totalJobs: result.totalJobs || 0
  };
}

module.exports = {
  recordJobPerformance,
  getPerformanceStatistics
};