import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import Reveal from '../components/Reveal';
import { useAuth } from '../context/AuthContext';

const statusPill = (status) => {
  const map = { pending: 'pill-muted', in_progress: 'pill-success', completed: 'pill-success', cancelled: 'pill-danger' };
  return map[status] || 'pill-muted';
};
const statusLabel = (s) => s.replace(/_/g, ' ');

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const canCreate = ['admin', 'supervisor'].includes(user?.role);

  const load = async () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    const { data } = await api.get('/orders', { params });
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Production Orders</h1>
        {canCreate && <Link to="/orders/create"><button>+ Create Order</button></Link>}
      </div>

      <div className="filter-bar glass">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state glass">No production orders yet.</div>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr><th>Order #</th><th>Product</th><th>Line</th><th>Target</th><th>Produced</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{o.orderNumber}</td>
                  <td>{o.product?.name}</td>
                  <td>{o.productionLine?.name}</td>
                  <td>{o.targetQuantity.toLocaleString()}</td>
                  <td>{o.producedQuantity.toLocaleString()}</td>
                  <td><span className={`pill ${statusPill(o.status)}`}>{statusLabel(o.status)}</span></td>
                  <td><Link to={`/orders/${o._id}`}><button className="secondary">Open</button></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Orders;
