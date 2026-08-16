require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const lineRoutes = require('./routes/lineRoutes');
const machineRoutes = require('./routes/machineRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const orderRoutes = require('./routes/orderRoutes');
const recordRoutes = require('./routes/recordRoutes');
const downtimeRoutes = require('./routes/downtimeRoutes');
const qualityRoutes = require('./routes/qualityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

connectDB();

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',')
  : '*';
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/lines', lineRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/downtime', downtimeRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
