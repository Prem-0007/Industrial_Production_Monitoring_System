const Downtime = require('../models/Downtime');
const Machine = require('../models/Machine');

const getDowntimes = async (req, res) => {
  const { status, reasonCode } = req.query;
  const query = {};
  if (status) query.status = status;
  if (reasonCode) query.reasonCode = reasonCode;

  const downtimes = await Downtime.find(query)
    .populate('machine', 'name code')
    .populate('reportedBy', 'name')
    .sort({ createdAt: -1 });
  res.json(downtimes);
};

const createDowntime = async (req, res) => {
  const { machine: machineId, reasonCode, description } = req.body;
  if (!machineId || !reasonCode) {
    return res.status(400).json({ message: 'Machine and reason code are required' });
  }

  const machine = await Machine.findById(machineId);
  if (!machine) return res.status(404).json({ message: 'Machine not found' });

  const downtime = await Downtime.create({
    machine: machineId,
    reasonCode,
    description: description || '',
    reportedBy: req.user._id,
    startTime: new Date()
  });

  machine.status = 'down';
  await machine.save();

  res.status(201).json(downtime);
};

const resolveDowntime = async (req, res) => {
  const downtime = await Downtime.findById(req.params.id);
  if (!downtime) return res.status(404).json({ message: 'Downtime record not found' });
  if (downtime.status === 'resolved') return res.status(400).json({ message: 'Already resolved' });

  const endTime = new Date();
  const durationMinutes = Math.max(1, Math.round((endTime - downtime.startTime) / 60000));

  downtime.status = 'resolved';
  downtime.endTime = endTime;
  downtime.durationMinutes = durationMinutes;
  await downtime.save();

  const machine = await Machine.findById(downtime.machine);
  if (machine) {
    machine.status = 'running';
    await machine.save();
  }

  res.json(downtime);
};

module.exports = { getDowntimes, createDowntime, resolveDowntime };
