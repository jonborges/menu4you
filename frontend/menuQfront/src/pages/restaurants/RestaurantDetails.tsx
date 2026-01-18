import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import styles from './RestaurantDetails.module.css';
import * as api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../contexts/NotificationContext';

export default function RestaurantDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { show } = useNotification();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        // Busca o restaurante diretamente do backend pelo ID
        const restaurantData = await api.getRestaurantById(Number(id));
        setRestaurant(restaurantData);
        const menu = await api.getItemsByRestaurant(Number(id));
        setItems(menu || []);

        // Busca equipe (simulado com usuários globais por enquanto)
        const usersRes = await api.fetchUsers();
        const usersList = Array.isArray(usersRes) ? usersRes : (usersRes?._embedded?.users || []);
        setTeam(usersList.slice(0, 4));
      } catch (e) {
        console.error(e);
        show('Erro ao carregar restaurante', 'error'); // The original code already had 'error' here.
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, show]);

  // Filtra itens pela busca
  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.description && i.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Agrupa itens por categoria
  const groupedItems = filteredItems.reduce((acc, item: any) => {
    const cat = item.category || 'Principais'; // Usa 'Principais' se não tiver categoria
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const categories = Object.keys(groupedItems);

  if (loading) return <div className={styles.pageWrapper}><Header /><div className={styles.loading}>Carregando cardápio...</div></div>;
  if (!restaurant) return <div className={styles.pageWrapper}><Header /><div className={styles.error}>Restaurante não encontrado</div></div>;

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <main className={styles.container}>
        {/* Capa do Restaurante */}
        <div className={styles.banner} style={{ backgroundImage: restaurant.cover ? `url(${restaurant.cover})` : undefined }}>
            {!restaurant.cover && <span className={styles.bannerPlaceholder}>CAPA</span>}
        </div>
        
        {/* Informações e Logo */}
        <div className={styles.headerInfo}>
            <div className={styles.logoContainer}>
                {restaurant.logo ? <img src={restaurant.logo} alt={restaurant.name} /> : <span>{restaurant.name?.charAt(0).toUpperCase()}</span>}
            </div>
            <div className={styles.infoText}>
                <h1 className={styles.title}>{restaurant.name}</h1>
                {restaurant.description && <p className={styles.description}>{restaurant.description}</p>}
                <div className={styles.meta}>
                    <span className={styles.rating}>⭐ {restaurant.rating || 'New'}</span>
                    <span className={styles.dot}>•</span>
                    <span>{restaurant.category || 'Geral'}</span>
                    <span className={styles.dot}>•</span>
                    <span>{restaurant.deliveryTime || '30-45 min'}</span>
                </div>
            </div>
        </div>

        {/* Pratos em Destaque (Highlights) */}
        {items.length > 0 && !searchTerm && (
          <section>
            <h2 className={styles.sectionTitle}>Pratos em alta</h2>
            <div className={styles.highlightsGrid}>
              {items.slice(0, 3).map(item => (
                <div key={item.id} className={styles.highlightCard}>
                  <div className={styles.highlightImage} style={{ backgroundImage: item.image ? `url(${item.image})` : undefined }} />
                  <div className={styles.itemContent} style={{ padding: '1.5rem' }}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemDesc}>{item.description}</p>
                    <div className={styles.itemPrice}>R$ {Number(item.price).toFixed(2)}</div>
                  </div>
                  <button className={styles.addButton} style={{ bottom: '1.5rem', right: '1.5rem' }} onClick={() => { addItem({ itemId: item.id, name: item.name, price: Number(item.price), quantity: 1 }); show('Adicionado!', 'info'); }}>+</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Busca no Cardápio */}
        <div className={styles.searchSection}>
            <input 
                type="text" 
                placeholder="Buscar no cardápio..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Navegação de Categorias (Sticky) */}
        {categories.length > 0 && (
          <div className={styles.categoryNav}>
            {categories.map(cat => (
              <button 
                key={cat} 
                className={styles.categoryLink} 
                onClick={() => document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Lista de Itens */}
        <div className={styles.menuSection}>
          {categories.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nenhum item encontrado no cardápio.</p>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat} id={`cat-${cat}`}>
                <h2 className={styles.menuTitle}>{cat}</h2>
                <h2 className={styles.sectionTitle}>{cat}</h2>
                <div className={styles.itemsGrid}>
                  {groupedItems[cat].map((item: any) => (
                    <div key={item.id} className={styles.itemCard}>
                      <div className={styles.itemContent}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        <p className={styles.itemDesc}>{item.description}</p>
                        <div className={styles.itemPrice}>R$ {Number(item.price).toFixed(2)}</div>
                      </div>
                      <div className={styles.itemImage} style={{ backgroundImage: item.image ? `url(${item.image})` : undefined }} />
                      <button className={styles.addButton} onClick={() => { addItem({ itemId: item.id, name: item.name, price: Number(item.price), quantity: 1 }); show('Item adicionado!', 'info'); }}>+</button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Seção da Equipe */}
        {team.length > 0 && (
          <section style={{ marginTop: '4rem' }}>
            <h2 className={styles.sectionTitle}>Conheça nossa equipe</h2>
            <div className={styles.teamGrid}>
              {team.map((member, index) => (
                <div key={member.id} className={styles.teamCard}>
                  <div className={styles.memberAvatar} style={{ backgroundImage: member.avatar ? `url(${member.avatar})` : undefined }}>
                    {!member.avatar && (member.username?.charAt(0).toUpperCase() || 'U')}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--brand-deep)', marginBottom: '0.25rem' }}>{member.username}</h3>
                  <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand-accent)', fontWeight: 700 }}>{['Chef', 'Gerente', 'Sommelier', 'Atendente'][index % 4]}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />

      {/* Fontes externas para o design */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
      `}} />
    </div>
  );
}