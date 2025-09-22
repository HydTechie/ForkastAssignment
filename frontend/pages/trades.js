import useSWR from 'swr';
const fetcher = (url) => fetch(url).then(r => r.json());

export default function Trades() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api';
  const { data, error } = useSWR(`${BACKEND}/orders/trades`, fetcher, { refreshInterval: 2000 });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  // fallback: make sure data is always an array
  const trades = Array.isArray(data?.data) ? data.data : [];

  return (
    <div style={{ maxWidth: 900, margin: 32 }}>
      <h1>Trades</h1>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Executed At</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Buy Order</th>
            <th>Sell Order</th>
          </tr>
        </thead>
        <tbody>
          {trades.length > 0 ? (
            trades.map(t => (
              <tr key={t.id}>
                <td>{t.executed_at ? new Date(t.executed_at).toLocaleString() : "-"}</td>
                <td>{t.price ?? "-"}</td>
                <td>{t.quantity ?? "-"}</td>
                <td>{t.buy_order_id ?? "-"}</td>
                <td>{t.sell_order_id ?? "-"}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={5}>No trades yet</td></tr>
          )}
        </tbody>
      </table>
      <div style={{ marginTop: 20 }}>
        <a href="/">Place Order</a> | <a href="/orderbook">View Orderbook</a>
      </div>
    </div>
  );
}
