import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './FloatingCart.module.css';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useUI } from '../../contexts/UIContext';

export default function FloatingCart() {
  const { items, total, updateQty, removeItem, checkout } = useCart();
  const [open, setOpen] = useState(false);
  const { isLoggedIn, userId } = useAuth();
  const location = useLocation();
  
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const { isSidebarOpen } = useUI();
  const { show } = useNotification();

  // Verificar se está em uma página de mesa
  const isOnMesaPage = location.pathname.includes('/menu/') && location.pathname.includes('/mesa/');

  // Só mostrar carrinho em páginas de mesa
  if (!isOnMesaPage) {
    return null;
  }

  // Na página de mesa, SEMPRE mostrar o carrinho (mesmo para owners testando)

  const handleOpen = () => {
    // Permitir abrir carrinho se tiver info de convidado
    const guestInfo = localStorage.getItem('guest_info');
    if (!isLoggedIn && !guestInfo) {
       // Se estiver na página de menu público, o modal de guest já deve ter aparecido.
       // Se não, redireciona ou avisa.
    }
    setOpen(true);
  };

  const doCheckout = async () => {
    try {
      const guestName = localStorage.getItem('guest_info') || undefined;
      await checkout(isLoggedIn && userId ? Number(userId) : null, guestName);
      show('Pedido enviado com sucesso!', 'info');
      setOpen(false);
    } catch (e) {
      show('Erro ao finalizar pedido: ' + String(e), 'error');
    }
  };

  return (
    <div className={`${styles.wrapper} ${isSidebarOpen ? styles.wrapperLeft : ''}`} aria-live="polite">
      {!open && (
        <button className={styles.fab} onClick={handleOpen} aria-label="Abrir carrinho">
          🛒 <span className={styles.badge}>{itemCount}</span>
          <div className={styles.total}>R$ {total().toFixed(2)}</div>
        </button>
      )}

      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <h2>Carrinho</h2>
            <button onClick={() => setOpen(false)} className={styles.close} aria-label="Fechar carrinho">Fechar</button>
          </div>
          
          <div className={styles.items}>
            {items.length === 0 ? (
              <div style={{ padding: '1rem', color: '#666' }}>Seu carrinho está vazio</div>
            ) : (
              items.map(i => (
                <div key={i.itemId} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{i.name}</span>
                    <div className={styles.itemMeta}>R$ {i.price.toFixed(2)} • x{i.quantity}</div>
                  </div>
                  <div className={styles.itemActions}>
                    <button onClick={() => updateQty(i.itemId, Math.max(1, i.quantity - 1))} aria-label="Diminuir quantidade">-</button>
                    <button onClick={() => updateQty(i.itemId, i.quantity + 1)} aria-label="Aumentar quantidade">+</button>
                    <button onClick={() => removeItem(i.itemId)} aria-label="Remover item">Rem</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.footer}>
            <div className={styles.total}>Total: R$ {total().toFixed(2)}</div>
            
            <button onClick={doCheckout} className={styles.checkoutButton} disabled={items.length === 0}>
              Finalizar Pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
