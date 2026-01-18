import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import styles from './RestaurantsPage.module.css';
import * as api from '../../services/api';

type Restaurant = { id: number; name: string; description?: string; cover?: string; rating?: number; deliveryTime?: string };

function defaultFilters() {
  return { q: '', maxPrice: 1000, minPrice: 0, minRating: 0, distanceKm: 50 };
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filters, setFilters] = useState(() => defaultFilters());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await api.getRestaurants();
        if (!mounted) return;
        setRestaurants(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      if (filters.q && !r.name.toLowerCase().includes(filters.q.toLowerCase())) return false;
      const stars = r.rating || 0;
      if (stars < filters.minRating) return false;
      // price and distance are not available from backend; keep as pass-through for now
      return true;
    });
  }, [restaurants, filters]);

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <main className={styles.container}>
        <div className={styles.headerRow}>
          <h1>Restaurantes</h1>
          <div className={styles.filters}> 
            <input placeholder="Buscar restaurante" value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} />
            <select value={filters.minRating} onChange={e => setFilters(f => ({ ...f, minRating: Number(e.target.value) }))}>
              <option value={0}>Todas as estrelas</option>
              <option value={5}>5+</option>
              <option value={4}>4+</option>
              <option value={3}>3+</option>
            </select>
          </div>
        </div>

        {loading ? <div>Carregando...</div> : (
          <div className={styles.grid}>
            {filtered.map(r => (
              <div key={r.id} className={styles.card}>
                <div className={styles.cardImage} style={{ height: 140, backgroundColor: '#eee', borderRadius: '12px 12px 0 0', backgroundImage: r.cover ? `url(${r.cover})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: '#1a3a32' }}>{r.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.description}</p>
                  <div className={styles.meta} style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a3a32' }}>
                    <span style={{ color: '#f97316' }}>⭐ {r.rating || 'New'}</span> • {r.deliveryTime || '30-45 min'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
      `}} />
    </div>
  );
}
