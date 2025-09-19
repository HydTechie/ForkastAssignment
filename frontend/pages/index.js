import { useState } from 'react';


export default function Home() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  const [form, setForm] = useState({ userId: '', price: '', quantity: '' });
  const [side, setSide] = useState('buy');
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const res = await fetch(`${BACKEND}/orders/${side}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: form.userId || 'guest',
        price: Number(form.price),
        quantity: Number(form.quantity)
      })
    });
    const data = await res.json();
    setResult(data);
  }

  return (
    <div style={{ maxWidth: 800, margin: '32px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Orderbook — Place Order</h1>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <label>User ID: </label>
          <input value={form.userId} onChange={e=>setForm({...form,userId:e.target.value})} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Price: </label>
          <input value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Quantity: </label>
          <input value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Side: </label>
          <select value={side} onChange={e=>setSide(e.target.value)}>
            <option value='buy'>Buy</option>
            <option value='sell'>Sell</option>
          </select>
        </div>
        <button type="submit">Place {side} order</button>
      </form>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Result</h3>
          <pre style={{ background: '#f3f3f3', padding: 12 }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <a href="/orderbook">View Orderbook</a> | <a href="/trades">View Trades</a>
      </div>
    </div>
  );
}
