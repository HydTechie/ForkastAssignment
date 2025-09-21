// controllers/orders.controller.js
const { validationResult } = require('express-validator');
const OrdersService = require('../services/orders.service');
const logger = require('../utils/logger');

const svc = new OrdersService();

async function placeOrder(req, res, next, side) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Validation failed", { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await svc.placeOrder(side, req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

exports.buy = (req, res, next) => placeOrder(req, res, next, 'buy');
exports.sell = (req, res, next) => placeOrder(req, res, next, 'sell');

exports.getOrderBook = async (req, res, next) => {
  try {
    const data = await svc.getOrderbook();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getTrades = async (req, res, next) => {
  try {
    const data = await svc.getTrades();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
