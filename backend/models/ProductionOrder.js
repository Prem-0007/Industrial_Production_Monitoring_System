const mongoose = require('mongoose');

const productionOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productionLine: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionLine', required: true },
    shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    targetQuantity: { type: Number, required: true, min: 1 },
    producedQuantity: { type: Number, default: 0 },
    rejectedQuantity: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductionOrder', productionOrderSchema);
