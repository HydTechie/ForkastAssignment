const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const AppError = require('../utils/app-error');

class OrdersService {
  async placeOrder(side, dto) {
    if (!dto?.userId || !dto?.price || !dto?.quantity) {
      throw new AppError('Invalid request payload', 400);
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      logger.info(`Placing ${side} order`, { userId: dto.userId, price: dto.price, qty: dto.quantity });

      const orderId = uuidv4();
      const insertOrderSql = `
        INSERT INTO orders (id, user_id, side, price, quantity, remaining, status)
        VALUES ($1,$2,$3,$4,$5,$5,'open')
        RETURNING *`;
      const insertVals = [orderId, dto.userId, side, dto.price, dto.quantity];

      const orderRes = await client.query(insertOrderSql, insertVals);
      let order = orderRes.rows[0];

      const trades = [];
      if (side === 'buy') {
        await this.#matchBuyOrder(client, order, trades);
      } else {
        await this.#matchSellOrder(client, order, trades);
      }

      await client.query('COMMIT');

      const updatedOrder = (
        await db.query('SELECT * FROM orders WHERE id=$1', [order.id])
      ).rows[0];

      logger.info(`Order ${updatedOrder.id} processed`, { status: updatedOrder.status });
      return { order: updatedOrder, trades };

    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Order placement failed', { error: err.message, stack: err.stack });
      throw err instanceof AppError ? err : new AppError('Failed to place order');
    } finally {
      client.release();
    }
  }

  async #matchBuyOrder(client, order, trades) {
    const candidates = await client.query(
      `SELECT * FROM orders
       WHERE side='sell' AND status IN ('open','partially_filled') AND price <= $1
       ORDER BY price ASC, created_at ASC FOR UPDATE`,
      [order.price]
    );

    for (const sell of candidates.rows) {
      if (Number(order.remaining) <= 0) break;
      const qty = Math.min(Number(sell.remaining), Number(order.remaining));

      const trade = await this.#createTrade(client, order.id, sell.id, sell.price, qty);
      trades.push(trade);

      await this.#updateOrderRemaining(client, sell.id, sell.remaining - qty, 'sell');
      order.remaining -= qty;
      await this.#updateOrderRemaining(client, order.id, order.remaining, 'buy');
    }
  }

  async #matchSellOrder(client, order, trades) {
    const candidates = await client.query(
      `SELECT * FROM orders
       WHERE side='buy' AND status IN ('open','partially_filled') AND price >= $1
       ORDER BY price DESC, created_at ASC FOR UPDATE`,
      [order.price]
    );

    for (const buy of candidates.rows) {
      if (Number(order.remaining) <= 0) break;
      const qty = Math.min(Number(buy.remaining), Number(order.remaining));

      const trade = await this.#createTrade(client, buy.id, order.id, buy.price, qty);
      trades.push(trade);

      await this.#updateOrderRemaining(client, buy.id, buy.remaining - qty, 'buy');
      order.remaining -= qty;
      await this.#updateOrderRemaining(client, order.id, order.remaining, 'sell');
    }
  }

  async #createTrade(client, buyOrderId, sellOrderId, price, qty) {
    const tradeId = uuidv4();
    const tradeSql = `
      INSERT INTO trades (id, buy_order_id, sell_order_id, price, quantity)
      VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const res = await client.query(tradeSql, [tradeId, buyOrderId, sellOrderId, price, qty]);
    logger.info(`Trade executed`, { tradeId, buyOrderId, sellOrderId, price, qty });
    return res.rows[0];
  }

  async #updateOrderRemaining(client, orderId, newRemaining, side) {
    const status = newRemaining === 0 ? 'filled' : 'partially_filled';
    await client.query(
      `UPDATE orders SET remaining=$1, status=$2 WHERE id=$3`,
      [newRemaining, status, orderId]
    );
    logger.debug(`Updated ${side} order`, { orderId, remaining: newRemaining, status });
  }

  async getOrderbook() {
    try {
      const buys = (
        await db.query(
          `SELECT price, SUM(remaining) as quantity
           FROM orders
           WHERE side='buy' AND status IN ('open','partially_filled')
           GROUP BY price
           ORDER BY price::numeric DESC`
        )
      ).rows;

      const sells = (
        await db.query(
          `SELECT price, SUM(remaining) as quantity
           FROM orders
           WHERE side='sell' AND status IN ('open','partially_filled')
           GROUP BY price
           ORDER BY price::numeric ASC`
        )
      ).rows;

      return { buys, sells };
    } catch (err) {
      logger.error('Failed to fetch orderbook', { error: err.message });
      throw new AppError('Could not fetch orderbook');
    }
  }

  async getTrades() {
    try {
      const trades = (
        await db.query(`SELECT * FROM trades ORDER BY executed_at DESC`)
      ).rows;
      return trades;
    } catch (err) {
      logger.error('Failed to fetch trades', { error: err.message });
      throw new AppError('Could not fetch trades');
    }
  }
}

module.exports = OrdersService;
