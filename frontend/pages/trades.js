import useSWR from 'swr';
const fetcher = (url) => fetch(url).then(r=>r.json());

export default function Trades() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  const { data, error } = useSWR(`${BACKEND}/trades`, fetcher, { refreshInterval: 2000 });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: 32 }}>
      <h1>Trades</h1>
      <table border="1" cellPadding="6">
        <thead><tr><th>Executed At</th><th>Price</th><th>Quantity</th><th>Buy Order</th><th>Sell Order</th></tr></thead>
        <tbody>
          {data.map(t => (
            <tr key={t.id}>
              <td>{new Date(t.executed_at).toLocaleString()}</td>
              <td>{t.price}</td>
              <td>{t.quantity}</td>
              <td>{t.buy_order_id}</td>
              <td>{t.sell_order_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 20 }}><a href="/">Place Order</a> | <a href="/orderbook">View Orderbook</a></div>
    </div>
  );
}
