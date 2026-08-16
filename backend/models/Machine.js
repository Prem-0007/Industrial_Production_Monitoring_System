const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    productionLine: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionLine', required: true },
    status: {
      type: String,
      enum: ['running', 'idle', 'down', 'maintenance'],
      default: 'idle'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Machine', machineSchema);
