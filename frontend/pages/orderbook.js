import useSWR from 'swr';
const fetcher = (url) => fetch(url).then(r => r.json());

export default function Orderbook() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api';
  const { data, error } = useSWR(`${BACKEND}/orders/orderbook`, fetcher, { refreshInterval: 2000 });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  // fallback to [] if buys or sells are missing/null
  const buys = data?.data?.buys ?? [];
  const sells = data?.data?.sells ?? [];

  return (
    <div style={{ maxWidth: 900, margin: 32 }}>
      <h1>Orderbook</h1>
      <div style={{ display: 'flex', gap: 40 }}>
        <div>
          <h3>Buys</h3>
          <table border="1" cellPadding="6">
            <thead><tr><th>Price</th><th>Quantity</th></tr></thead>
            <tbody>
              {buys.length > 0 ? (
                buys.map(b => (
                  <tr key={b.price}>
                    <td>{b.price}</td>
                    <td>{b.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={2}>No buy orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div>
          <h3>Sells</h3>
          <table border="1" cellPadding="6">
            <thead><tr><th>Price</th><th>Quantity</th></tr></thead>
            <tbody>
              {sells.length > 0 ? (
                sells.map(s => (
                  <tr key={s.price}>
                    <td>{s.price}</td>
                    <td>{s.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={2}>No sell orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <a href="/">Place Order</a> | <a href="/trades">View Trades</a>
      </div>
    </div>
  );
}
