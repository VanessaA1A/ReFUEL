const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const pointRoutes = require('./routes/pointRoutes');
const oilTypeRoutes = require('./routes/oilTypeRoutes');
const requestRoutes = require('./routes/requestRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/oil-types', oilTypeRoutes);
app.use('/api/requests', requestRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use(errorHandler);

module.exports = app;
