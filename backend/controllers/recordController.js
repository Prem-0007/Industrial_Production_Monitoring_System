const ProductionRecord = require('../models/ProductionRecord');
const ProductionOrder = require('../models/ProductionOrder');

const getRecords = async (req, res) => {
  const { productionOrder } = req.query;
  const query = {};
  if (productionOrder) query.productionOrder = productionOrder;

  const records = await ProductionRecord.find(query)
    .populate('machine', 'name code')
    .populate('recordedBy', 'name')
    .sort({ createdAt: -1 });
  res.json(records);
};

const createRecord = async (req, res) => {
  const { productionOrder: orderId, machine, quantityProduced, quantityRejected } = req.body;
  if (!orderId || !machine) {
    return res.status(400).json({ message: 'Production order and machine are required' });
  }

  const order = await ProductionOrder.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Production order not found' });

  const produced = Number(quantityProduced) || 0;
  const rejected = Number(quantityRejected) || 0;

  const record = await ProductionRecord.create({
    productionOrder: orderId,
    machine,
    quantityProduced: produced,
    quantityRejected: rejected,
    recordedBy: req.user._id
  });

  order.producedQuantity += produced;
  order.rejectedQuantity += rejected;
  if (order.status === 'pending') order.status = 'in_progress';
  if (order.producedQuantity >= order.targetQuantity) order.status = 'completed';
  await order.save();

  res.status(201).json(record);
};

module.exports = { getRecords, createRecord };
