import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Reveal from '../components/Reveal';

const Quality = () => {
  const [inspections, setInspections] = useState([]);
  const [orders, setOrders] = useState([]);
  const [machines, setMachines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productionOrder: '', machine: '', quantityInspected: '', quantityPassed: '', quantityFailed: '', notes: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: insp }, { data: ords }, { data: ms }] = await Promise.all([
      api.get('/quality'),
      api.get('/orders'),
      api.get('/machines')
    ]);
    setInspections(insp);
    setOrders(ords);
    setMachines(ms);
    setForm((f) => ({
      ...f,
      productionOrder: f.productionOrder || ords[0]?._id || '',
      machine: f.machine || ms[0]?._id || ''
    }));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/quality', {
        ...form,
        quantityInspected: Number(form.quantityInspected),
        quantityPassed: Number(form.quantityPassed) || 0,
        quantityFailed: Number(form.quantityFailed) || 0
      });
      setShowForm(false);
      setForm({ ...form, quantityInspected: '', quantityPassed: '', quantityFailed: '', notes: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log inspection');
    }
    setBusy(false);
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Quality Inspection</h1>
        {orders.length > 0 && machines.length > 0 && <button onClick={() => setShowForm(true)}>+ Log Inspection</button>}
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : inspections.length === 0 ? (
        <div className="empty-state glass">No quality inspections logged yet.</div>
      ) : (
        <div className="reg-list">
          {inspections.map((q, i) => (
            <Reveal key={q._id} delay={Math.min(i * 30, 300)}>
              <div className="record-item glass">
                <div className="record-header">
                  <h3>{q.machine?.name}</h3>
                  <span className={`pill ${q.result === 'pass' ? 'pill-success' : 'pill-danger'}`}>{q.result}</span>
                </div>
                <p className="course-meta">Inspected: {q.quantityInspected} · Passed: {q.quantityPassed} · Failed: {q.quantityFailed}</p>
                {q.notes && <p className="course-meta">{q.notes}</p>}
                <p className="course-meta">By {q.inspectedBy?.name} · {new Date(q.createdAt).toLocaleString()}</p>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <form className="modal-card glass" onSubmit={handleSubmit}>
            <h2>Log Quality Inspection</h2>
            {error && <div className="error-msg">{error}</div>}
            <label>Production Order</label>
            <select value={form.productionOrder} onChange={(e) => setForm({ ...form, productionOrder: e.target.value })}>
              {orders.map((o) => <option key={o._id} value={o._id}>{o.orderNumber}</option>)}
            </select>
            <label>Machine</label>
            <select value={form.machine} onChange={(e) => setForm({ ...form, machine: e.target.value })}>
              {machines.map((m) => <option key={m._id} value={m._id}>{m.name} ({m.code})</option>)}
            </select>
            <label>Quantity Inspected</label>
            <input type="number" min="1" value={form.quantityInspected} onChange={(e) => setForm({ ...form, quantityInspected: e.target.value })} required />
            <div className="form-row">
              <div>
                <label>Quantity Passed</label>
                <input type="number" min="0" value={form.quantityPassed} onChange={(e) => setForm({ ...form, quantityPassed: e.target.value })} />
              </div>
              <div>
                <label>Quantity Failed</label>
                <input type="number" min="0" value={form.quantityFailed} onChange={(e) => setForm({ ...form, quantityFailed: e.target.value })} />
              </div>
            </div>
            <label>Notes (optional)</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" disabled={busy}>Log Inspection</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default Quality;
