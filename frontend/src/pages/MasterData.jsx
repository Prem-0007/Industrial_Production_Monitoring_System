import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

const TABS = ['Products', 'Lines', 'Machines', 'Shifts'];

const MasterData = () => {
  const [tab, setTab] = useState('Products');
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([]);
  const [machines, setMachines] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [productForm, setProductForm] = useState({ name: '', sku: '', description: '' });
  const [lineForm, setLineForm] = useState({ name: '', code: '', description: '' });
  const [machineForm, setMachineForm] = useState({ name: '', code: '', productionLine: '', status: 'idle' });
  const [shiftForm, setShiftForm] = useState({ name: '', startTime: '', endTime: '' });

  const loadAll = async () => {
    const [p, l, m, s] = await Promise.all([
      api.get('/products'), api.get('/lines'), api.get('/machines'), api.get('/shifts')
    ]);
    setProducts(p.data);
    setLines(l.data);
    setMachines(m.data);
    setShifts(s.data);
    if (!machineForm.productionLine && l.data.length) {
      setMachineForm((f) => ({ ...f, productionLine: l.data[0]._id }));
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreate = async (endpoint, payload, resetForm) => {
    setError('');
    setBusy(true);
    try {
      await api.post(endpoint, payload);
      resetForm();
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
    setBusy(false);
  };

  const handleDelete = async (endpoint, id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Master Data</h1>

      <div className="tab-bar glass">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? '' : 'secondary'} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {error && <div className="error-msg">{error}</div>}

      {tab === 'Products' && (
        <div className="panel glass">
          <h2>Products</h2>
          <form className="form-row" onSubmit={(e) => { e.preventDefault(); handleCreate('/products', productForm, () => setProductForm({ name: '', sku: '', description: '' })); }}>
            <input placeholder="Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
            <input placeholder="SKU" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} required />
            <button type="submit" disabled={busy}>Add</button>
          </form>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Name</th><th>SKU</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}><td>{p.name}</td><td>{p.sku}</td><td><button className="danger" onClick={() => handleDelete('/products', p._id)}>Delete</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Lines' && (
        <div className="panel glass">
          <h2>Production Lines</h2>
          <form className="form-row" onSubmit={(e) => { e.preventDefault(); handleCreate('/lines', lineForm, () => setLineForm({ name: '', code: '', description: '' })); }}>
            <input placeholder="Name" value={lineForm.name} onChange={(e) => setLineForm({ ...lineForm, name: e.target.value })} required />
            <input placeholder="Code" value={lineForm.code} onChange={(e) => setLineForm({ ...lineForm, code: e.target.value })} required />
            <button type="submit" disabled={busy}>Add</button>
          </form>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Code</th><th></th></tr></thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l._id}><td>{l.name}</td><td>{l.code}</td><td><button className="danger" onClick={() => handleDelete('/lines', l._id)}>Delete</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Machines' && (
        <div className="panel glass">
          <h2>Machines</h2>
          {lines.length === 0 ? (
            <div className="empty-state">Add a Production Line first.</div>
          ) : (
            <form className="form-row" onSubmit={(e) => { e.preventDefault(); handleCreate('/machines', machineForm, () => setMachineForm({ ...machineForm, name: '', code: '' })); }}>
              <input placeholder="Name" value={machineForm.name} onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })} required />
              <input placeholder="Code" value={machineForm.code} onChange={(e) => setMachineForm({ ...machineForm, code: e.target.value })} required />
              <select value={machineForm.productionLine} onChange={(e) => setMachineForm({ ...machineForm, productionLine: e.target.value })}>
                {lines.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
              <button type="submit" disabled={busy}>Add</button>
            </form>
          )}
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Code</th><th>Line</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {machines.map((m) => (
                  <tr key={m._id}>
                    <td>{m.name}</td><td>{m.code}</td><td>{m.productionLine?.name}</td><td>{m.status}</td>
                    <td><button className="danger" onClick={() => handleDelete('/machines', m._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Shifts' && (
        <div className="panel glass">
          <h2>Shifts</h2>
          <form className="form-row" onSubmit={(e) => { e.preventDefault(); handleCreate('/shifts', shiftForm, () => setShiftForm({ name: '', startTime: '', endTime: '' })); }}>
            <input placeholder="Name (e.g. Morning)" value={shiftForm.name} onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })} required />
            <input type="time" value={shiftForm.startTime} onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })} required />
            <input type="time" value={shiftForm.endTime} onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })} required />
            <button type="submit" disabled={busy}>Add</button>
          </form>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Start</th><th>End</th><th></th></tr></thead>
              <tbody>
                {shifts.map((s) => (
                  <tr key={s._id}><td>{s.name}</td><td>{s.startTime}</td><td>{s.endTime}</td><td><button className="danger" onClick={() => handleDelete('/shifts', s._id)}>Delete</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MasterData;
