const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class OrdersService {
  constructor() {}

  async placeOrder(side, dto) {
    if (!dto.userId || !dto.price || !dto.quantity) {
      const err = new Error('Invalid request');
      err.status = 400;
      throw err;
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const orderId = uuidv4();
      const insertText = `
        INSERT INTO orders (id, user_id, side, price, quantity, remaining, status)
        VALUES ($1,$2,$3,$4,$5,$5,'open') RETURNING *`;
      const insertVals = [orderId, dto.userId, side, dto.price, dto.quantity];
      const orderRes = await client.query(insertText, insertVals);
      let order = orderRes.rows[0];

      // matching
      const trades = [];
      if (side === 'buy') {
        // get sell candidates: price <= buy.price, lowest price first, then oldest
        const cand = await client.query(
          `SELECT * FROM orders
           WHERE side='sell' AND status IN ('open','partially_filled') AND price <= $1
           ORDER BY price ASC, created_at ASC FOR UPDATE`,
          [dto.price]
        );
        for (const sell of cand.rows) {
          if (Number(order.remaining) <= 0) break;
          const qty = Math.min(Number(sell.remaining), Number(order.remaining));
          const tradeId = uuidv4();
          const tradeIns = await client.query(
            `INSERT INTO trades (id,buy_order_id,sell_order_id,price,quantity)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [tradeId, order.id, sell.id, sell.price, qty]
          );
          trades.push(tradeIns.rows[0]);

          // update sell
          const newSellRemaining = Number(sell.remaining) - qty;
          const sellStatus = newSellRemaining === 0 ? 'filled' : 'partially_filled';
          await client.query(
            `UPDATE orders SET remaining=$1, status=$2 WHERE id=$3`,
            [newSellRemaining, sellStatus, sell.id]
          );

          // update buy order remaining
          order.remaining = Number(order.remaining) - qty;
          const buyStatus = order.remaining === 0 ? 'filled' : 'partially_filled';
          await client.query(`UPDATE orders SET remaining=$1, status=$2 WHERE id=$3`,
            [order.remaining, buyStatus, order.id]);
        }
      } else {
        // sell side: match buy orders with price >= sell.price, highest price first
        const cand = await client.query(
          `SELECT * FROM orders
           WHERE side='buy' AND status IN ('open','partially_filled') AND price >= $1
           ORDER BY price DESC, created_at ASC FOR UPDATE`,
          [dto.price]
        );
        for (const buy of cand.rows) {
          if (Number(order.remaining) <= 0) break;
          const qty = Math.min(Number(buy.remaining), Number(order.remaining));
          const tradeId = uuidv4();
          const tradeIns = await client.query(
            `INSERT INTO trades (id,buy_order_id,sell_order_id,price,quantity)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [tradeId, buy.id, order.id, buy.price, qty]
          );
          trades.push(tradeIns.rows[0]);

          // update buy
          const newBuyRemaining = Number(buy.remaining) - qty;
          const buyStatus = newBuyRemaining === 0 ? 'filled' : 'partially_filled';
          await client.query(
            `UPDATE orders SET remaining=$1, status=$2 WHERE id=$3`,
            [newBuyRemaining, buyStatus, buy.id]
          );

          // update sell order remaining
          order.remaining = Number(order.remaining) - qty;
          const sellStatus = order.remaining === 0 ? 'filled' : 'partially_filled';
          await client.query(`UPDATE orders SET remaining=$1, status=$2 WHERE id=$3`,
            [order.remaining, sellStatus, order.id]);
        }
      }

      await client.query('COMMIT');

      // fetch updated order
      const updated = (await db.query('SELECT * FROM orders WHERE id=$1', [order.id])).rows[0];
      return { order: updated, trades };

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getOrderbook() {
    const buys = (await db.query(
      `SELECT price, SUM(remaining) as quantity FROM orders
       WHERE side='buy' AND status IN ('open','partially_filled')
       GROUP BY price ORDER BY price::numeric DESC`)).rows;
    const sells = (await db.query(
      `SELECT price, SUM(remaining) as quantity FROM orders
       WHERE side='sell' AND status IN ('open','partially_filled')
       GROUP BY price ORDER BY price::numeric ASC`)).rows;
    return { buys, sells };
  }

  async getTrades() {
    const trades = (await db.query(
      `SELECT * FROM trades ORDER BY executed_at DESC`)).rows;
    return trades;
  }
}

module.exports = OrdersService;
