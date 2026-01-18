import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import CategoryItemsSection from '../home/suport/CategoryItemsSection';
import GuestInfoModal from '../../components/modals/GuestInfoModal';
import FloatingCart from '../../components/cart/FloatingCart';
import homeStyles from '../home/Home.module.css';
import * as api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useItemModal } from '../../contexts/ItemModalContext';

interface Restaurant {
  id: number;
  name: string;
  description: string;
  cover: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  image?: string;
}

export function PublicMenu() {
  const { restaurantId, tableNumber } = useParams<{ restaurantId: string; tableNumber: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);
  const { setTableNumber } = useCart();
  const { openModal } = useItemModal();
  
  // Estados para busca
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Verificar se já tem guest_info no localStorage
  useEffect(() => {
    const stored = localStorage.getItem('guest_info');
    if (stored) {
      setGuestName(stored);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!restaurantId) throw new Error('ID do restaurante não fornecido');

        // Definir mesa no carrinho
        if (tableNumber) {
          const tableNum = parseInt(tableNumber, 10);
          setTableNumber(tableNum);
          localStorage.setItem('current_table_number', String(tableNum));
          localStorage.setItem('current_restaurant_id', restaurantId);
        }

        // Buscar informações do restaurante
        const restaurantRes = await api.getRestaurantById(Number(restaurantId));
        setRestaurant(restaurantRes);

        // Buscar funcionários
        const employeesRes = await api.getEmployeesByRestaurant(Number(restaurantId));
        const employeesList = Array.isArray(employeesRes) 
          ? employeesRes 
          : (employeesRes?._embedded?.employees || []);
        setEmployees(employeesList);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, tableNumber, setTableNumber]);

  // Busca de items
  useEffect(() => {
    if (!q || q.length < 2 || !restaurantId) {
      setSuggestions([]);
      return;
    }

    let mounted = true;
    const id = setTimeout(async () => {
      try {
        const itemsResRaw = await api.getItemsByRestaurant(Number(restaurantId));
        if (!mounted) return;
        
        const itemsRes = Array.isArray(itemsResRaw) ? itemsResRaw : (itemsResRaw?._embedded?.items || []);
        const filteredItems = itemsRes.filter((it: any) => 
          it && it.name && it.name.toLowerCase().includes(q.toLowerCase())
        );
        
        // Converter URLs relativas para absolutas
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const fixedItems = filteredItems.map((item: any) => ({
          ...item,
          image: item.image && item.image.startsWith('/') ? `${apiUrl}${item.image}` : item.image
        }));
        
        setSuggestions(fixedItems.slice(0, 8));
      } catch (e) {
        console.error(e);
      }
    }, 250);
    return () => { mounted = false; clearTimeout(id); };
  }, [q, restaurantId]);

  if (loading) {
    return (
      <div className={homeStyles.container}>
        <Header />
        <main className={homeStyles.main} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p>Carregando cardápio...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className={homeStyles.container}>
        <Header />
        <main className={homeStyles.main} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            <h2 style={{ marginBottom: '1rem' }}>⚠️ Erro</h2>
            <p>{error || 'Não foi possível carregar o cardápio'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      {!guestName && <GuestInfoModal onSubmit={(name) => {
        setGuestName(name);
        localStorage.setItem('guest_info', name);
      }} />}
      <FloatingCart />
      <div className={homeStyles.container}>
        <Header />
        <main className={homeStyles.main}>
        {/* Hero Section com Info do Restaurante e Mesa */}
        <section className={homeStyles.hero}>
          <div 
            className={homeStyles.heroBanner} 
            style={{ 
              backgroundImage: restaurant.cover ? `url(${restaurant.cover})` : undefined, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            {/* Overlay escuro para melhor contraste */}
            {restaurant.cover && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(26, 58, 50, 0.4)',
                zIndex: 0
              }} />
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1>{restaurant.name}</h1>
              <p style={{ marginBottom: '1.5rem' }}>{restaurant.description || 'Bem-vindo!'}</p>
              <div style={{
                display: 'inline-block',
                background: '#fff3e0',
                border: '2px solid #f97316',
                color: '#f97316',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem'
              }}>
                📍 Mesa <span style={{ fontWeight: 'bold', marginLeft: '0.5rem' }}>{tableNumber}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Barra de Busca */}
        <div style={{ 
          maxWidth: '600px', 
          margin: '2rem auto',
          position: 'relative',
          padding: '0 1rem'
        }}>
          <input 
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="🔍 Busque por pratos..."
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '50px',
              outline: 'none',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1a3a32'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          {suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '1rem',
              right: '1rem',
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              marginTop: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {suggestions.map((item: any) => (
                <div 
                  key={item.id} 
                  onClick={() => { 
                    openModal(item, Number(restaurantId)); 
                    setQ(''); 
                    setSuggestions([]); 
                  }}
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <strong>{item.name}</strong>
                  {item.price && <span style={{ color: '#f97316', marginLeft: '0.5rem' }}>R$ {item.price.toFixed(2)}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cardápio - Usar CategoryItemsSection */}
        {restaurantId && (
          <CategoryItemsSection restaurantId={Number(restaurantId)} />
        )}

        {/* Seção de Equipe - Mesmo estilo da Home */}
        {employees.length > 0 && (
          <section style={{ marginTop: '4rem' }}>
            <h2 className={homeStyles.sectionTitle}>Conheça nossa equipe</h2>
            <div className={homeStyles.teamGrid}>
              {employees.map((emp) => (
                <div key={emp.id} className={homeStyles.teamCard}>
                  <div 
                    className={homeStyles.memberAvatar} 
                    style={{ backgroundImage: emp.image ? `url(${emp.image})` : undefined }}
                  >
                    {!emp.image && emp.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className={homeStyles.memberInfo}>
                    <h3>{emp.name}</h3>
                    <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', fontWeight: 700 }}>
                      {emp.role || 'Membro'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
    </>
  );
}
