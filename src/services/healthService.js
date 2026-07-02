const mongoose = require('mongoose');
const { redisClient } = require('../config/redisClient');
const { jobQueue } = require('../queues/jobQueue');
const { WorkerModel } = require('../models/workerModel');

async function checkRedisConnection() {
  try {
    await redisClient.ping();
    return { status: 'UP' };
  } catch (error) {
    return { status: 'DOWN', error: error.message };
  }
}

async function checkMongoConnection() {
  const statusMap = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING'
  };

  const state = mongoose.connection.readyState;
  return {
    status: state === 1 ? 'UP' : 'DOWN',
    connectionState: statusMap[state] || 'UNKNOWN'
  };
}

async function checkQueueStatus() {
  try {
    const jobCounts = await jobQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
    return { status: 'UP', jobCounts };
  } catch (error) {
    return { status: 'DOWN', error: error.message };
  }
}

async function checkWorkerStatus() {
  const [total, busy, offline] = await Promise.all([
    WorkerModel.countDocuments({}),
    WorkerModel.countDocuments({ status: 'Busy' }),
    WorkerModel.countDocuments({ status: 'Offline' })
  ]);

  return {
    status: total === 0 || offline === total ? 'DOWN' : busy > 0 ? 'DEGRADED' : 'HEALTHY',
    totalWorkers: total,
    busyWorkers: busy,
    offlineWorkers: offline
  };
}

async function getSystemHealth() {
  const [redis, mongo, queue, workers] = await Promise.all([
    checkRedisConnection(),
    checkMongoConnection(),
    checkQueueStatus(),
    checkWorkerStatus()
  ]);

  const statuses = [redis.status, mongo.status, queue.status, workers.status];
  const overallStatus = statuses.includes('DOWN')
    ? 'DOWN'
    : statuses.includes('DEGRADED')
      ? 'DEGRADED'
      : 'HEALTHY';

  return {
    status: overallStatus,
    components: {
      redis,
      mongo,
      queue,
      workers
    }
  };
}

module.exports = {
  getSystemHealth,
  checkRedisConnection,
  checkMongoConnection,
  checkQueueStatus,
  checkWorkerStatus
};