const mongoose = require('mongoose');

const downtimeSchema = new mongoose.Schema(
  {
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    reasonCode: {
      type: String,
      enum: ['breakdown', 'material', 'changeover', 'quality'],
      required: true
    },
    durationMinutes: { type: Number, min: 0, default: 0 },
    description: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Downtime', downtimeSchema);
