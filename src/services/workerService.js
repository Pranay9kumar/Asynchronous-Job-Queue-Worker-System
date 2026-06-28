const { WorkerModel } = require('../models/workerModel');

async function upsertWorker(workerId, concurrency) {
  return WorkerModel.findOneAndUpdate(
    { workerId },
    {
      $set: {
        status: 'Idle',
        concurrency,
        lastActiveAt: new Date()
      }
    },
    { upsert: true, new: true }
  ).lean();
}

async function setWorkerBusy(workerId) {
  return WorkerModel.updateOne(
    { workerId },
    {
      $set: {
        status: 'Busy',
        lastActiveAt: new Date()
      }
    }
  );
}

async function setWorkerIdle(workerId) {
  return WorkerModel.updateOne(
    { workerId },
    {
      $set: {
        status: 'Idle',
        lastActiveAt: new Date()
      }
    }
  );
}

async function markWorkerOffline(workerId) {
  return WorkerModel.updateOne(
    { workerId },
    {
      $set: {
        status: 'Offline',
        lastActiveAt: new Date()
      }
    }
  );
}

async function incrementWorkerProcessed(workerId) {
  return WorkerModel.updateOne(
    { workerId },
    {
      $inc: {
        jobsProcessed: 1
      },
      $set: {
        lastActiveAt: new Date()
      }
    }
  );
}

async function listWorkers() {
  return WorkerModel.find({}).sort({ workerId: 1 }).lean();
}

async function getWorkerMetrics() {
  const [activeWorkers, idleWorkers, totals] = await Promise.all([
    WorkerModel.countDocuments({ status: 'Busy' }),
    WorkerModel.countDocuments({ status: 'Idle' }),
    WorkerModel.aggregate([
      {
        $group: {
          _id: null,
          totalProcessedJobs: { $sum: '$jobsProcessed' }
        }
      }
    ])
  ]);

  return {
    activeWorkers,
    idleWorkers,
    totalProcessedJobs: totals[0]?.totalProcessedJobs || 0
  };
}

module.exports = {
  upsertWorker,
  setWorkerBusy,
  setWorkerIdle,
  markWorkerOffline,
  incrementWorkerProcessed,
  listWorkers,
  getWorkerMetrics
};