const ProductionLine = require('../models/ProductionLine');
const Machine = require('../models/Machine');

const getLines = async (req, res) => {
  const lines = await ProductionLine.find().sort({ createdAt: -1 });
  res.json(lines);
};

const createLine = async (req, res) => {
  const { name, code, description } = req.body;
  if (!name || !code) return res.status(400).json({ message: 'Name and code are required' });

  const existing = await ProductionLine.findOne({ code });
  if (existing) return res.status(400).json({ message: 'Line code already exists' });

  const line = await ProductionLine.create({ name, code, description: description || '' });
  res.status(201).json(line);
};

const updateLine = async (req, res) => {
  const line = await ProductionLine.findById(req.params.id);
  if (!line) return res.status(404).json({ message: 'Production line not found' });

  const { name, description } = req.body;
  Object.assign(line, { name, description });
  await line.save();
  res.json(line);
};

const deleteLine = async (req, res) => {
  const line = await ProductionLine.findById(req.params.id);
  if (!line) return res.status(404).json({ message: 'Production line not found' });

  const machineCount = await Machine.countDocuments({ productionLine: line._id });
  if (machineCount > 0) {
    return res.status(400).json({ message: 'Cannot delete line with machines assigned to it' });
  }

  await line.deleteOne();
  res.json({ message: 'Production line removed' });
};

module.exports = { getLines, createLine, updateLine, deleteLine };
