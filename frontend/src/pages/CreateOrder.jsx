import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [form, setForm] = useState({ orderNumber: '', product: '', productionLine: '', shift: '', targetQuantity: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/lines'), api.get('/shifts')]).then(([p, l, s]) => {
      setProducts(p.data);
      setLines(l.data);
      setShifts(s.data);
      setForm((f) => ({
        ...f,
        product: p.data[0]?._id || '',
        productionLine: l.data[0]?._id || '',
        shift: s.data[0]?._id || ''
      }));
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/orders', { ...form, targetQuantity: Number(form.targetQuantity) });
      navigate(`/orders/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    }
    setBusy(false);
  };

  if (loading) return <Layout><div className="full-loader"><div className="spinner" /></div></Layout>;

  if (products.length === 0 || lines.length === 0 || shifts.length === 0) {
    return (
      <Layout>
        <h1 className="page-title">Create Production Order</h1>
        <div className="empty-state glass">
          You need at least one Product, one Production Line, and one Shift before creating an order.
          Go to Master Data to add them first.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="page-title">Create Production Order</h1>

      <form className="form-card glass" onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}

        <label>Order Number</label>
        <input placeholder="PO-001" value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} required />

        <label>Product</label>
        <select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}>
          {products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
        </select>

        <label>Production Line</label>
        <select value={form.productionLine} onChange={(e) => setForm({ ...form, productionLine: e.target.value })}>
          {lines.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
        </select>

        <label>Shift</label>
        <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}>
          {shifts.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        <label>Target Quantity</label>
        <input type="number" min="1" value={form.targetQuantity} onChange={(e) => setForm({ ...form, targetQuantity: e.target.value })} required />

        <button type="submit" disabled={busy}>{busy ? 'Creating...' : 'Create Order'}</button>
      </form>
    </Layout>
  );
};

export default CreateOrder;
