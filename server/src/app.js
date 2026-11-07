const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const syncRoutes = require('./routes/sync.routes');
const receiptsRoutes = require('./routes/receipts.routes');
const { errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/sync', syncRoutes);
  app.use('/api/receipts', receiptsRoutes);

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));

  // Wraps async route handlers so a rejected promise reaches errorHandler instead of hanging the request.
  app.use((err, req, res, next) => errorHandler(err, req, res, next));

  return app;
}

module.exports = { createApp };
