import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import styles from './CategoryPage.module.css';
import * as api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../contexts/NotificationContext';
import { categories } from '../home/suport/CategoryCards';
import { useItemModal } from '../../contexts/ItemModalContext';

export default function CategoryPage() {
  const { type } = useParams();
  const { addItem } = useCart();
  const { openModal } = useItemModal();
  const { show } = useNotification();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tenta encontrar o nome bonito da categoria (ex: "lanches" -> "Lanches")
  const categoryInfo = categories.find(c => c.id === type);
  const title = categoryInfo ? categoryInfo.name : type;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Busca todos os itens e filtra no front, já que o backend ainda não tem busca por categoria global
        const allItems = await api.searchItems('');
        const list = Array.isArray(allItems) ? allItems : [];
        
        const filtered = list.filter((item: any) => 
          item.category && item.category.toLowerCase() === type?.toLowerCase()
        );
        setItems(filtered);
      } catch (e) {
        console.error(e);
        show('Erro ao carregar itens', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, show]);

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <main className={styles.container}>
        <h1 className={styles.title}>{title}</h1>
        
        {loading ? (
          <p>Carregando...</p>
        ) : items.length === 0 ? (
          <p>Nenhum item encontrado nesta categoria.</p>
        ) : (
          <div className={styles.dishGrid}>
            {items.map(item => (
              <div 
                key={item.id} 
                className={styles.dishCard}
                onClick={() => openModal(item)}
              >
                <div className={styles.imagePlaceholder} style={{ backgroundImage: item.image ? `url(${item.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className={styles.cardInfo}>
                  <h3>{item.name}</h3>
                  <p>R$ {Number(item.price).toFixed(2).replace('.', ',')}</p>
                </div>
                <button className={styles.cardButton} onClick={(e) => {
                  e.stopPropagation();
                  addItem({ itemId: item.id, name: item.name, price: Number(item.price), quantity: 1 });
                  show('Adicionado ao carrinho', 'info');
                }}>Pedir</button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}