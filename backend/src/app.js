 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('express').json;
const ordersRouter = require('./orders/orders.router');

const app = express();
app.use(cors()); // Allow all origins (for development)
app.use(bodyParser());

app.get('/', (req, res) => res.json({ status: 'ok', service: 'orderbook-backend' }));

app.use('/', ordersRouter);

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => console.log(`Orderbook API listening on http://localhost:${port}`));
}

module.exports = app;
