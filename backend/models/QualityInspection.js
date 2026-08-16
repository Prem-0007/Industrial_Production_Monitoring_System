const mongoose = require('mongoose');

const qualityInspectionSchema = new mongoose.Schema(
  {
    productionOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionOrder', required: true },
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    quantityInspected: { type: Number, required: true, min: 1 },
    quantityPassed: { type: Number, required: true, min: 0 },
    quantityFailed: { type: Number, required: true, min: 0 },
    result: { type: String, enum: ['pass', 'fail'], required: true },
    notes: { type: String, trim: true, default: '' },
    inspectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('QualityInspection', qualityInspectionSchema);
