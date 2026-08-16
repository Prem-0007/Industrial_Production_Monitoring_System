import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Reveal from '../components/Reveal';

const REASON_CODES = ['breakdown', 'material', 'changeover', 'quality'];

const Downtime = () => {
  const [downtimes, setDowntimes] = useState([]);
  const [machines, setMachines] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ machine: '', reasonCode: 'breakdown', description: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    const [{ data: dts }, { data: ms }] = await Promise.all([
      api.get('/downtime', { params }),
      api.get('/machines')
    ]);
    setDowntimes(dts);
    setMachines(ms);
    if (!form.machine && ms.length) setForm((f) => ({ ...f, machine: ms[0]._id }));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/downtime', form);
      setShowForm(false);
      setForm({ ...form, description: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log downtime');
    }
    setBusy(false);
  };

  const handleResolve = async (id) => {
    await api.put(`/downtime/${id}/resolve`);
    load();
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Downtime Log</h1>
        {machines.length > 0 && <button onClick={() => setShowForm(true)}>+ Log Downtime</button>}
      </div>

      <div className="filter-bar glass">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : downtimes.length === 0 ? (
        <div className="empty-state glass">No downtime recorded.</div>
      ) : (
        <div className="reg-list">
          {downtimes.map((d, i) => (
            <Reveal key={d._id} delay={Math.min(i * 30, 300)}>
              <div className="record-item glass">
                <div className="record-header">
                  <h3>{d.machine?.name} ({d.machine?.code})</h3>
                  <span className={`pill ${d.status === 'open' ? 'pill-danger' : 'pill-success'}`}>{d.status}</span>
                </div>
                <p className="course-meta">Reason: {d.reasonCode}</p>
                {d.description && <p className="course-meta">{d.description}</p>}
                <p className="course-meta">Started: {new Date(d.startTime).toLocaleString()}</p>
                {d.status === 'resolved' && <p className="course-meta">Duration: {d.durationMinutes} min</p>}
                {d.status === 'open' && (
                  <button style={{ marginTop: 10 }} onClick={() => handleResolve(d._id)}>Mark Resolved</button>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <form className="modal-card glass" onSubmit={handleSubmit}>
            <h2>Log Downtime</h2>
            {error && <div className="error-msg">{error}</div>}
            <label>Machine</label>
            <select value={form.machine} onChange={(e) => setForm({ ...form, machine: e.target.value })}>
              {machines.map((m) => <option key={m._id} value={m._id}>{m.name} ({m.code})</option>)}
            </select>
            <label>Reason Code</label>
            <select value={form.reasonCode} onChange={(e) => setForm({ ...form, reasonCode: e.target.value })}>
              {REASON_CODES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <label>Description (optional)</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" disabled={busy}>Log Downtime</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default Downtime;
