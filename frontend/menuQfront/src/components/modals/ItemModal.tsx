import React from 'react';
import { X } from 'lucide-react';
import { useItemModal } from '../../contexts/ItemModalContext';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './ItemModal.module.css';

export default function ItemModal() {
  const { isOpen, selectedItem, restaurantId, closeModal } = useItemModal();
  const { addItem } = useCart();
  const { show } = useNotification();

  if (!isOpen || !selectedItem) return null;

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={closeModal}>
          <X size={20} />
        </button>
        <div className={styles.image} style={{ backgroundImage: selectedItem.image ? `url(${selectedItem.image})` : undefined }} />
        <div className={styles.content}>
          <h2 className={styles.title}>{selectedItem.name}</h2>
          <p className={styles.description}>{selectedItem.description || 'Sem descrição disponível.'}</p>
          
          <button 
            className={styles.addButton}
            onClick={() => {
              addItem({ 
                itemId: selectedItem.id, 
                name: selectedItem.name, 
                price: Number(selectedItem.price), 
                quantity: 1,
                restaurantId: restaurantId || selectedItem.restaurantId
              });
              show('Adicionado ao carrinho', 'info');
              closeModal();
            }}
          >
            <span>Adicionar ao Pedido</span>
            <span>R$ {Number(selectedItem.price).toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}