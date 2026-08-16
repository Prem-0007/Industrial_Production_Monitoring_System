import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Reveal from '../components/Reveal';

const statusColor = (status) => {
  const map = { running: 'pill-success', idle: 'pill-muted', down: 'pill-danger', maintenance: 'pill-danger' };
  return map[status] || 'pill-muted';
};

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    const { data } = await api.get('/machines', { params });
    setMachines(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const counts = machines.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Layout>
      <h1 className="page-title">Machine Monitoring</h1>

      <div className="stat-grid">
        <div className="stat-card glass"><span className="stat-label">Running</span><span className="stat-value">{counts.running || 0}</span></div>
        <div className="stat-card glass"><span className="stat-label">Idle</span><span className="stat-value">{counts.idle || 0}</span></div>
        <div className="stat-card glass"><span className="stat-label">Down</span><span className="stat-value">{counts.down || 0}</span></div>
        <div className="stat-card glass"><span className="stat-label">Maintenance</span><span className="stat-value">{counts.maintenance || 0}</span></div>
      </div>

      <div className="filter-bar glass">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="running">Running</option>
          <option value="idle">Idle</option>
          <option value="down">Down</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : machines.length === 0 ? (
        <div className="empty-state glass">No machines found. Add machines in Master Data.</div>
      ) : (
        <div className="machine-grid">
          {machines.map((m, i) => (
            <Reveal key={m._id} delay={Math.min(i * 30, 300)}>
              <div className="machine-card glass">
                <div className={`machine-status-dot ${m.status}`} />
                <h3>{m.name}</h3>
                <p className="course-meta">{m.code}</p>
                <p className="course-meta">{m.productionLine?.name}</p>
                <span className={`pill ${statusColor(m.status)}`}>{m.status}</span>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Machines;
