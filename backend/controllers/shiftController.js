const Shift = require('../models/Shift');

const getShifts = async (req, res) => {
  const shifts = await Shift.find().sort({ createdAt: -1 });
  res.json(shifts);
};

const createShift = async (req, res) => {
  const { name, startTime, endTime } = req.body;
  if (!name || !startTime || !endTime) {
    return res.status(400).json({ message: 'Name, start time and end time are required' });
  }

  const shift = await Shift.create({ name, startTime, endTime });
  res.status(201).json(shift);
};

const updateShift = async (req, res) => {
  const shift = await Shift.findById(req.params.id);
  if (!shift) return res.status(404).json({ message: 'Shift not found' });

  const { name, startTime, endTime } = req.body;
  Object.assign(shift, { name, startTime, endTime });
  await shift.save();
  res.json(shift);
};

const deleteShift = async (req, res) => {
  const shift = await Shift.findById(req.params.id);
  if (!shift) return res.status(404).json({ message: 'Shift not found' });
  await shift.deleteOne();
  res.json({ message: 'Shift removed' });
};

module.exports = { getShifts, createShift, updateShift, deleteShift };
