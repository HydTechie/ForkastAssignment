// routes/orders.routes.js
const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/orders.controller');

const router = express.Router();

const orderValidation = [
  body('userId').notEmpty().withMessage('UserId is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0')
];

router.post('/buy', orderValidation, controller.buy);
router.post('/sell', orderValidation, controller.sell);
router.get('/orderbook', controller.getOrderBook);
router.get('/trades', controller.getTrades);

module.exports = router;
