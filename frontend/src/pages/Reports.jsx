import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import api from '../api/axios';
import Layout from '../components/Layout';
import Reveal from '../components/Reveal';

const PIE_COLORS = ['#f59e0b', '#10b981', '#c2410c', '#84cc16', '#eab308'];

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/reports').then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Layout><div className="full-loader"><div className="spinner" /></div></Layout>;

  const trendData = data.productionTrend.map((d) => ({ day: d._id.slice(5), produced: d.produced, rejected: d.rejected }));
  const machineStatusData = data.machineStatusAgg.map((m) => ({ name: m._id, value: m.count }));
  const downtimeData = data.downtimeBreakdown.map((d) => ({ reason: d._id, minutes: d.totalMinutes, count: d.count }));
  const shiftData = data.shiftPerformance.map((s) => ({ shift: s._id, produced: s.produced, rejected: s.rejected }));

  return (
    <Layout>
      <h1 className="page-title">Reports & Analytics</h1>

      <Reveal>
        <div className="panel glass">
          <h2>Production Trend (Last 7 Days)</h2>
          {trendData.length === 0 ? <div className="empty-state">No production data yet.</div> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                <XAxis dataKey="day" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--glass-border)', borderRadius: 10 }} />
                <Legend />
                <Line type="monotone" dataKey="produced" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="rejected" stroke="#c2410c" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="panel glass">
          <h2>Machine Status Breakdown</h2>
          {machineStatusData.length === 0 ? <div className="empty-state">No machines yet.</div> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={machineStatusData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {machineStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--glass-border)', borderRadius: 10 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Reveal>

      <Reveal delay={160}>
        <div className="panel glass">
          <h2>Downtime Breakdown (Pareto by Reason Code)</h2>
          {downtimeData.length === 0 ? <div className="empty-state">No downtime logged yet.</div> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={downtimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                <XAxis dataKey="reason" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--glass-border)', borderRadius: 10 }} />
                <Bar dataKey="minutes" fill="#c2410c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Reveal>

      <Reveal delay={240}>
        <div className="panel glass">
          <h2>Shift Performance Comparison</h2>
          {shiftData.length === 0 ? <div className="empty-state">No shift data yet.</div> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={shiftData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                <XAxis dataKey="shift" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--glass-border)', borderRadius: 10 }} />
                <Legend />
                <Bar dataKey="produced" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="rejected" fill="#c2410c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Reveal>
    </Layout>
  );
};

export default Reports;
