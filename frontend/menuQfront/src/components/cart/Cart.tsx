import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';

export default function Cart() {
  const { items, updateQty, removeItem, total, checkout } = useCart();
  const [userId, setUserId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const doCheckout = async () => {
    try {
      setLoading(true);
      const res = await checkout(userId);
      setResult(res);
    } catch (e) {
      alert(String(e));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 12 }}>
      <h3>Carrinho</h3>
      {items.length === 0 && <div>Vazio</div>}
      <ul>
        {items.map(i => (
          <li key={i.itemId}>
            {i.name} — R$ {i.price} x {i.quantity}
            <button onClick={() => updateQty(i.itemId, Math.max(1, i.quantity - 1))}>-</button>
            <button onClick={() => updateQty(i.itemId, i.quantity + 1)}>+</button>
            <button onClick={() => removeItem(i.itemId)}>Remover</button>
          </li>
        ))}
      </ul>
      <div>Total: R$ {total().toFixed(2)}</div>
      <div>
        <label>Seu userId: <input type="number" value={userId} onChange={e => setUserId(Number(e.target.value))} /></label>
      </div>
      <button onClick={doCheckout} disabled={loading || items.length === 0}>{loading ? 'Enviando...' : 'Finalizar Pedido'}</button>

      {result && <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
