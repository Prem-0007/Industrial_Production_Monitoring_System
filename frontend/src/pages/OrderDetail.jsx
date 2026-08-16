import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import Reveal from '../components/Reveal';
import { useAuth } from '../context/AuthContext';

const statusPill = (status) => {
  const map = { pending: 'pill-muted', in_progress: 'pill-success', completed: 'pill-success', cancelled: 'pill-danger' };
  return map[status] || 'pill-muted';
};
const statusLabel = (s) => s.replace(/_/g, ' ');

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [records, setRecords] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [entryForm, setEntryForm] = useState({ machine: '', quantityProduced: '', quantityRejected: '' });
  const canManage = ['admin', 'supervisor'].includes(user?.role);

  const load = async () => {
    setLoading(true);
    const [{ data: o }, { data: recs }, { data: allMachines }] = await Promise.all([
      api.get(`/orders/${id}`),
      api.get('/records', { params: { productionOrder: id } }),
      api.get('/machines', { params: { productionLine: '' } })
    ]);
    setOrder(o);
    setRecords(recs);
    const lineMachines = allMachines.filter((m) => m.productionLine?._id === o.productionLine?._id);
    setMachines(lineMachines.length ? lineMachines : allMachines);
    if (!entryForm.machine && lineMachines.length) {
      setEntryForm((f) => ({ ...f, machine: lineMachines[0]._id }));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/records', {
        productionOrder: id,
        machine: entryForm.machine,
        quantityProduced: Number(entryForm.quantityProduced) || 0,
        quantityRejected: Number(entryForm.quantityRejected) || 0
      });
      setEntryForm({ ...entryForm, quantityProduced: '', quantityRejected: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log production');
    }
    setBusy(false);
  };

  const handleStatusChange = async (status) => {
    await api.put(`/orders/${id}/status`, { status });
    load();
  };

  if (loading) return <Layout><div className="full-loader"><div className="spinner" /></div></Layout>;
  if (!order) return <Layout><div className="empty-state glass">Order not found.</div></Layout>;

  const progressPct = order.targetQuantity > 0 ? Math.min(100, Math.round((order.producedQuantity / order.targetQuantity) * 100)) : 0;

  return (
    <Layout>
      <Link to="/orders" className="link-more">&larr; Back to orders</Link>
      <div className="page-header" style={{ marginTop: 10 }}>
        <h1 className="page-title">{order.orderNumber}</h1>
        <span className={`pill ${statusPill(order.status)}`}>{statusLabel(order.status)}</span>
      </div>

      <Reveal>
        <div className="panel glass">
          <h2>Order Details</h2>
          <p className="course-meta">Product: {order.product?.name} ({order.product?.sku})</p>
          <p className="course-meta">Line: {order.productionLine?.name} · Shift: {order.shift?.name}</p>
          <p className="course-meta">Created by: {order.createdBy?.name}</p>

          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="course-meta">{order.producedQuantity} / {order.targetQuantity} produced ({progressPct}%) · {order.rejectedQuantity} rejected</p>

          {canManage && order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="owner-actions" style={{ marginTop: 10, marginLeft: 0 }}>
              {order.status === 'pending' && <button onClick={() => handleStatusChange('in_progress')}>Start Order</button>}
              <button className="danger" onClick={() => handleStatusChange('cancelled')}>Cancel Order</button>
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="panel glass">
          <h2>Log Production Entry</h2>
          {error && <div className="error-msg">{error}</div>}
          {machines.length === 0 ? (
            <div className="empty-state">No machines available. Add machines in Master Data first.</div>
          ) : (
            <form onSubmit={handleEntrySubmit}>
              <label>Machine</label>
              <select value={entryForm.machine} onChange={(e) => setEntryForm({ ...entryForm, machine: e.target.value })}>
                {machines.map((m) => <option key={m._id} value={m._id}>{m.name} ({m.code})</option>)}
              </select>
              <div className="form-row">
                <div>
                  <label>Quantity Produced</label>
                  <input type="number" min="0" value={entryForm.quantityProduced} onChange={(e) => setEntryForm({ ...entryForm, quantityProduced: e.target.value })} />
                </div>
                <div>
                  <label>Quantity Rejected</label>
                  <input type="number" min="0" value={entryForm.quantityRejected} onChange={(e) => setEntryForm({ ...entryForm, quantityRejected: e.target.value })} />
                </div>
              </div>
              <button type="submit" disabled={busy}>{busy ? 'Logging...' : 'Log Entry'}</button>
            </form>
          )}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="panel glass">
          <h2>Production Records ({records.length})</h2>
          {records.length === 0 ? (
            <div className="empty-state">No production entries logged yet.</div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr><th>Machine</th><th>Produced</th><th>Rejected</th><th>By</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>{r.machine?.name}</td>
                      <td>{r.quantityProduced}</td>
                      <td>{r.quantityRejected}</td>
                      <td>{r.recordedBy?.name}</td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Reveal>
    </Layout>
  );
};

export default OrderDetail;
