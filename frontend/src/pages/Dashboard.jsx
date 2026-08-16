import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Reveal from '../components/Reveal';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Layout><div className="full-loader"><div className="spinner" /></div></Layout>;

  return (
    <Layout>
      <h1 className="page-title">Production Dashboard</h1>

      <div className="kpi-grid">
        <div className="kpi-card glass">
          <span className="kpi-value">{data.productionAchievement}%</span>
          <span className="kpi-label">Production Achievement</span>
          <span className="kpi-sub">Target: {data.target.toLocaleString()} | Produced: {data.produced.toLocaleString()}</span>
        </div>
        <div className="kpi-card glass">
          <span className="kpi-value">{data.qualityRate}%</span>
          <span className="kpi-label">Quality Rate</span>
          <span className="kpi-sub">Good: {data.goodQty.toLocaleString()} | Rejected: {data.rejectedQty.toLocaleString()}</span>
        </div>
        <div className="kpi-card glass">
          <span className="kpi-value">{data.totalDowntimeMinutes}</span>
          <span className="kpi-label">Downtime (min)</span>
          <span className="kpi-sub">
            Breakdown: {data.downtimeByReason.breakdown} | Material: {data.downtimeByReason.material} | Changeover: {data.downtimeByReason.changeover} | Quality: {data.downtimeByReason.quality}
          </span>
        </div>
        <div className="kpi-card glass">
          <span className="kpi-value">{data.machineStatus.running}</span>
          <span className="kpi-label">Machines Running</span>
          <span className="kpi-sub">
            Idle: {data.machineStatus.idle} | Down: {data.machineStatus.down} | Maintenance: {data.machineStatus.maintenance}
          </span>
        </div>
      </div>

      <Reveal>
        <div className="panel glass">
          <h2>Plant Overview</h2>
          <p className="course-meta">Total machines tracked: {data.totalMachines}</p>
          <p className="course-meta">
            This dashboard aggregates live data from Production Orders, Downtime Logs, and Quality Inspections.
            Head to Reports for trend charts and Pareto breakdowns.
          </p>
        </div>
      </Reveal>
    </Layout>
  );
};

export default Dashboard;
