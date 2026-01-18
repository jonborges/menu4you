import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import styles from '../category/CategoryPage.module.css'; // Reusando estilos
import * as api from '../../services/api';
import { useItemModal } from '../../contexts/ItemModalContext';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const { openModal } = useItemModal();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.searchItems(q);
        const list = Array.isArray(res) ? res : [];
        setItems(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (q) load();
    else { setItems([]); setLoading(false); }
  }, [q]);

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <main className={styles.container}>
        <h1 className={styles.title}>Resultados para "{q}"</h1>
        
        {loading ? (
          <p>Buscando...</p>
        ) : items.length === 0 ? (
          <p>Nenhum item encontrado.</p>
        ) : (
          <div className={styles.dishGrid}>
            {items.map(item => (
              <div 
                key={item.id} 
                className={styles.dishCard}
                onClick={() => openModal(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.imagePlaceholder} style={{ backgroundImage: item.image ? `url(${item.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className={styles.cardInfo}>
                  <h3>{item.name}</h3>
                  <p>R$ {Number(item.price).toFixed(2).replace('.', ',')}</p>
                </div>
                <button className={styles.cardButton}>Ver Detalhes</button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}