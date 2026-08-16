const mongoose = require('mongoose');

const productionRecordSchema = new mongoose.Schema(
  {
    productionOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionOrder', required: true },
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    quantityProduced: { type: Number, required: true, min: 0, default: 0 },
    quantityRejected: { type: Number, required: true, min: 0, default: 0 },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductionRecord', productionRecordSchema);
