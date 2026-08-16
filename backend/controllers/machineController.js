const Machine = require('../models/Machine');
const Downtime = require('../models/Downtime');

const getMachines = async (req, res) => {
  const { productionLine, status } = req.query;
  const query = {};
  if (productionLine) query.productionLine = productionLine;
  if (status) query.status = status;

  const machines = await Machine.find(query).populate('productionLine', 'name code').sort({ createdAt: -1 });
  res.json(machines);
};

const createMachine = async (req, res) => {
  const { name, code, productionLine, status } = req.body;
  if (!name || !code || !productionLine) {
    return res.status(400).json({ message: 'Name, code and production line are required' });
  }

  const existing = await Machine.findOne({ code });
  if (existing) return res.status(400).json({ message: 'Machine code already exists' });

  const machine = await Machine.create({ name, code, productionLine, status: status || 'idle' });
  res.status(201).json(machine);
};

const updateMachine = async (req, res) => {
  const machine = await Machine.findById(req.params.id);
  if (!machine) return res.status(404).json({ message: 'Machine not found' });

  const { name, status, productionLine } = req.body;
  Object.assign(machine, { name, status, productionLine });
  await machine.save();
  res.json(machine);
};

const deleteMachine = async (req, res) => {
  const machine = await Machine.findById(req.params.id);
  if (!machine) return res.status(404).json({ message: 'Machine not found' });
  await machine.deleteOne();
  res.json({ message: 'Machine removed' });
};

module.exports = { getMachines, createMachine, updateMachine, deleteMachine };
