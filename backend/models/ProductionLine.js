const mongoose = require('mongoose');

const productionLineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductionLine', productionLineSchema);
