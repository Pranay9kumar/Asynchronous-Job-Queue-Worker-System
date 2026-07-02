const mongoose = require('mongoose');

const metricSnapshotSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const MetricSnapshotModel = mongoose.model('MetricSnapshot', metricSnapshotSchema);

module.exports = { MetricSnapshotModel };