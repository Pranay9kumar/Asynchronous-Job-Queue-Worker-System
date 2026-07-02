const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    workerId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['Idle', 'Busy', 'Offline'],
      default: 'Idle',
      index: true
    },
    jobsProcessed: {
      type: Number,
      default: 0,
      min: 0
    },
    currentJobId: {
      type: String,
      default: null,
      index: true
    },
    currentJobType: {
      type: String,
      default: null
    },
    currentJobStartedAt: {
      type: Date,
      default: null
    },
    lastActiveAt: {
      type: Date,
      default: null
    },
    lastHeartbeatAt: {
      type: Date,
      default: null
    },
    concurrency: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

const WorkerModel = mongoose.model('Worker', workerSchema);

module.exports = { WorkerModel };