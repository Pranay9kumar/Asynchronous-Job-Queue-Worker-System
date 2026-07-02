const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM'
    },
    message: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    acknowledged: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const AlertModel = mongoose.model('Alert', alertSchema);

module.exports = { AlertModel };