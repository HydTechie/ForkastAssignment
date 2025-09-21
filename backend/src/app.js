const express = require('express');
const cors = require('cors');
const ordersRoutes = require('./routes/orders.router');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/orders', ordersRoutes);

// Error handling middleware (last)
app.use(errorHandler);

app.listen(3000, () => {
  logger.info('Server running on port 3000');
});

module.exports = app;
