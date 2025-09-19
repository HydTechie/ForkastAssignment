-- initial schema for orderbook
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy','sell')),
  price numeric NOT NULL,
  quantity numeric NOT NULL,
  remaining numeric NOT NULL,
  status text NOT NULL CHECK (status IN ('open','filled','partially_filled','cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buy_order_id uuid NOT NULL,
  sell_order_id uuid NOT NULL,
  price numeric NOT NULL,
  quantity numeric NOT NULL,
  executed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_side_price_created ON orders (side, price, created_at);
