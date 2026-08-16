const ProductionOrder = require('../models/ProductionOrder');
const Machine = require('../models/Machine');
const Downtime = require('../models/Downtime');
const QualityInspection = require('../models/QualityInspection');
const ProductionRecord = require('../models/ProductionRecord');

const getDashboard = async (req, res) => {
  const orderAgg = await ProductionOrder.aggregate([
    { $group: { _id: null, target: { $sum: '$targetQuantity' }, produced: { $sum: '$producedQuantity' } } }
  ]);
  const target = orderAgg.length ? orderAgg[0].target : 0;
  const produced = orderAgg.length ? orderAgg[0].produced : 0;
  const productionAchievement = target > 0 ? Math.round((produced / target) * 1000) / 10 : 0;

  const qualityAgg = await QualityInspection.aggregate([
    { $group: { _id: null, passed: { $sum: '$quantityPassed' }, failed: { $sum: '$quantityFailed' } } }
  ]);
  const goodQty = qualityAgg.length ? qualityAgg[0].passed : 0;
  const rejectedQty = qualityAgg.length ? qualityAgg[0].failed : 0;
  const inspectedTotal = goodQty + rejectedQty;
  const qualityRate = inspectedTotal > 0 ? Math.round((goodQty / inspectedTotal) * 1000) / 10 : 0;

  const downtimeAgg = await Downtime.aggregate([
    { $group: { _id: '$reasonCode', totalMinutes: { $sum: '$durationMinutes' } } }
  ]);
  const downtimeByReason = { breakdown: 0, material: 0, changeover: 0, quality: 0 };
  let totalDowntimeMinutes = 0;
  downtimeAgg.forEach((d) => {
    downtimeByReason[d._id] = d.totalMinutes;
    totalDowntimeMinutes += d.totalMinutes;
  });

  const machineStatusAgg = await Machine.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const machineStatus = { running: 0, idle: 0, down: 0, maintenance: 0 };
  let totalMachines = 0;
  machineStatusAgg.forEach((m) => {
    machineStatus[m._id] = m.count;
    totalMachines += m.count;
  });

  res.json({
    productionAchievement,
    target,
    produced,
    qualityRate,
    goodQty,
    rejectedQty,
    totalDowntimeMinutes,
    downtimeByReason,
    machineStatus,
    totalMachines
  });
};

const getReports = async (req, res) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const productionTrend = await ProductionRecord.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        produced: { $sum: '$quantityProduced' },
        rejected: { $sum: '$quantityRejected' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const machineStatusAgg = await Machine.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const downtimeBreakdown = await Downtime.aggregate([
    { $group: { _id: '$reasonCode', totalMinutes: { $sum: '$durationMinutes' }, count: { $sum: 1 } } },
    { $sort: { totalMinutes: -1 } }
  ]);

  const shiftPerformance = await ProductionOrder.aggregate([
    {
      $lookup: {
        from: 'shifts',
        localField: 'shift',
        foreignField: '_id',
        as: 'shiftDoc'
      }
    },
    { $unwind: '$shiftDoc' },
    {
      $group: {
        _id: '$shiftDoc.name',
        produced: { $sum: '$producedQuantity' },
        rejected: { $sum: '$rejectedQuantity' }
      }
    }
  ]);

  res.json({ productionTrend, machineStatusAgg, downtimeBreakdown, shiftPerformance });
};

module.exports = { getDashboard, getReports };
