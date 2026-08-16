const QualityInspection = require('../models/QualityInspection');
const ProductionOrder = require('../models/ProductionOrder');

const getInspections = async (req, res) => {
  const { productionOrder } = req.query;
  const query = {};
  if (productionOrder) query.productionOrder = productionOrder;

  const inspections = await QualityInspection.find(query)
    .populate('machine', 'name code')
    .populate('inspectedBy', 'name')
    .sort({ createdAt: -1 });
  res.json(inspections);
};

const createInspection = async (req, res) => {
  const { productionOrder: orderId, machine, quantityInspected, quantityPassed, quantityFailed, notes } = req.body;
  if (!orderId || !machine || !quantityInspected) {
    return res.status(400).json({ message: 'Production order, machine and quantity inspected are required' });
  }

  const order = await ProductionOrder.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Production order not found' });

  const passed = Number(quantityPassed) || 0;
  const failed = Number(quantityFailed) || 0;
  const result = failed > 0 ? 'fail' : 'pass';

  const inspection = await QualityInspection.create({
    productionOrder: orderId,
    machine,
    quantityInspected,
    quantityPassed: passed,
    quantityFailed: failed,
    result,
    notes: notes || '',
    inspectedBy: req.user._id
  });

  res.status(201).json(inspection);
};

module.exports = { getInspections, createInspection };
