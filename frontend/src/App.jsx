import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import OrderDetail from './pages/OrderDetail';
import Machines from './pages/Machines';
import Downtime from './pages/Downtime';
import Quality from './pages/Quality';
import MasterData from './pages/MasterData';
import Reports from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/orders/create" element={<ProtectedRoute roles={['admin', 'supervisor']}><CreateOrder /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
      <Route path="/machines" element={<ProtectedRoute><Machines /></ProtectedRoute>} />
      <Route path="/downtime" element={<ProtectedRoute><Downtime /></ProtectedRoute>} />
      <Route path="/quality" element={<ProtectedRoute><Quality /></ProtectedRoute>} />
      <Route path="/master-data" element={<ProtectedRoute roles={['admin', 'supervisor']}><MasterData /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
