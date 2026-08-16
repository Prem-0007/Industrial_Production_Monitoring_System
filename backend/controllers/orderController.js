const ProductionOrder = require('../models/ProductionOrder');
const ProductionRecord = require('../models/ProductionRecord');
const QualityInspection = require('../models/QualityInspection');

const getOrders = async (req, res) => {
  const { status, productionLine } = req.query;
  const query = {};
  if (status) query.status = status;
  if (productionLine) query.productionLine = productionLine;

  const orders = await ProductionOrder.find(query)
    .populate('product', 'name sku')
    .populate('productionLine', 'name code')
    .populate('shift', 'name')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
  res.json(orders);
};

const getOrder = async (req, res) => {
  const order = await ProductionOrder.findById(req.params.id)
    .populate('product', 'name sku')
    .populate('productionLine', 'name code')
    .populate('shift', 'name')
    .populate('createdBy', 'name');
  if (!order) return res.status(404).json({ message: 'Production order not found' });
  res.json(order);
};

const createOrder = async (req, res) => {
  const { orderNumber, product, productionLine, shift, targetQuantity } = req.body;
  if (!orderNumber || !product || !productionLine || !shift || !targetQuantity) {
    return res.status(400).json({ message: 'Missing required production order fields' });
  }

  const existing = await ProductionOrder.findOne({ orderNumber });
  if (existing) return res.status(400).json({ message: 'Order number already exists' });

  const order = await ProductionOrder.create({
    orderNumber,
    product,
    productionLine,
    shift,
    targetQuantity,
    createdBy: req.user._id
  });
  res.status(201).json(order);
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'in_progress', 'completed', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const order = await ProductionOrder.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Production order not found' });

  order.status = status;
  await order.save();
  res.json(order);
};

const deleteOrder = async (req, res) => {
  const order = await ProductionOrder.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Production order not found' });

  await ProductionRecord.deleteMany({ productionOrder: order._id });
  await QualityInspection.deleteMany({ productionOrder: order._id });
  await order.deleteOne();
  res.json({ message: 'Production order removed' });
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus, deleteOrder };
