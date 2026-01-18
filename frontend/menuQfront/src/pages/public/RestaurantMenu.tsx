import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import * as api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useItemModal } from '../../contexts/ItemModalContext';
import GuestInfoModal from '../../components/modals/GuestInfoModal';
import styles from '../home/Home.module.css';

export default function RestaurantMenu() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { openModal } = useItemModal();
  const { show } = useNotification();
  
  const [restaurant, setRestaurant] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState<string | null>(localStorage.getItem('guest_info'));

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [restRes, itemsRes] = await Promise.all([
          api.getRestaurantById(Number(id)),
          api.getItemsByRestaurant(Number(id))
        ]);
        setRestaurant(restRes);
        const list = Array.isArray(itemsRes) ? itemsRes : (itemsRes?._embedded?.items || []);
        setItems(list);
      } catch (e) {
        console.error(e);
        show('Erro ao carregar cardápio', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleGuestSubmit = (name: string) => {
    localStorage.setItem('guest_info', name);
    setGuestName(name);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando cardápio...</div>;
  if (!restaurant) return <div style={{ padding: '2rem', textAlign: 'center' }}>Restaurante não encontrado.</div>;

  return (
    <div className={styles.container}>
      {!guestName && <GuestInfoModal onSubmit={handleGuestSubmit} />}
      
      <Header simple />
      <main className={styles.main}>
        <section className={styles.hero} style={{ minHeight: '30vh' }}>
          <div className={styles.heroBanner}>
            <h1 style={{ fontSize: '2.5rem' }}>{restaurant.name}</h1>
            <p>{restaurant.description}</p>
            {guestName && <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>Olá, {guestName}</p>}
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>Cardápio</h2>
          <div className={styles.dishGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {items.map((item) => (
              <div 
                key={item.id} 
                className={styles.dishCard}
                onClick={() => openModal(item)}
              >
                <div className={styles.imagePlaceholder} style={{ backgroundImage: item.image ? `url(${item.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', height: '140px' }} />
                <div className={styles.cardInfo}>
                  <h3>{item.name}</h3>
                  <p>R$ {Number(item.price).toFixed(2).replace('.', ',')}</p>
                </div>
                <button className={styles.cardButton} onClick={(e) => {
                  e.stopPropagation();
                  addItem({ itemId: item.id, name: item.name, price: Number(item.price), quantity: 1, restaurantId: Number(id) });
                  show('Adicionado ao carrinho', 'info');
                }}>Pedir</button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
