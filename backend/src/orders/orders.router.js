const express = require('express');
const { body, validationResult } = require('express-validator');
const OrdersService = require('./orders.service');

const router = express.Router();
const svc = new OrdersService();

router.post('/orders/buy', [
  body('userId').notEmpty(),
  body('price').isFloat({ gt: 0 }),
  body('quantity').isFloat({ gt: 0 })
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    const result = await svc.placeOrder('buy', req.body);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/orders/sell', [
  body('userId').notEmpty(),
  body('price').isFloat({ gt: 0 }),
  body('quantity').isFloat({ gt: 0 })
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    const result = await svc.placeOrder('sell', req.body);
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/orderbook', async (req, res, next) => {
  try {
    const ob = await svc.getOrderbook();
    res.json(ob);
  } catch (err) { next(err); }
});

router.get('/trades', async (req, res, next) => {
  try {
    const trades = await svc.getTrades();
    res.json(trades);
  } catch (err) { next(err); }
});

module.exports = router;
