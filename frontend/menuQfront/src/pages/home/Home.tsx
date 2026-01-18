import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import styles from './Home.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../contexts/NotificationContext';
import * as api from '../../services/api';
import CategoryItemsSection from './suport/CategoryItemsSection';
import { useItemModal } from '../../contexts/ItemModalContext';

// Componente HowItWorks com animações
function HowItWorksSection() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1 && !visibleSteps.includes(index)) {
              setTimeout(() => {
                setVisibleSteps(prev => [...prev, index]);
              }, index * 200); // Delay escalonado
            }
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    );

    stepRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [visibleSteps]);

  const steps = [
    {
      icon: '📝',
      title: 'Crie seu Cardápio',
      description: 'Cadastre seus pratos, fotos e preços em um painel intuitivo e fácil de usar.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: '📱',
      title: 'Gere o QR Code',
      description: 'Imprima o código exclusivo de cada mesa do seu restaurante.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: '🍽️',
      title: 'Cliente Faz o Pedido',
      description: 'Cliente escaneia o QR da mesa, escolhe os pratos e finaliza o pedido diretamente pelo celular.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: '🔔',
      title: 'Receba em Tempo Real',
      description: 'Os pedidos chegam instantaneamente no seu dashboard, organizados por mesa com nome do cliente.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  return (
    <section ref={sectionRef} className={styles.howItWorksSection}>
      <h2 className={`${styles.sectionTitle} ${styles.centeredTitle}`}>
        Como funciona?
      </h2>
      <p className={styles.sectionSubtitle}>
        Quatro passos simples para revolucionar seu restaurante
      </p>
      
      <div className={styles.stepsTimeline}>
        {steps.map((step, index) => (
          <div
            key={index}
            ref={el => stepRefs.current[index] = el}
            className={`${styles.stepCard} ${visibleSteps.includes(index) ? styles.visible : ''}`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <div className={styles.stepNumber}>
              <span>{index + 1}</span>
            </div>
            
            <div className={styles.stepIconContainer} style={{ background: step.gradient }}>
              <span className={styles.stepIcon}>{step.icon}</span>
            </div>
            
            <div className={styles.stepContent}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            
            {index < steps.length - 1 && (
              <div className={styles.stepConnector}></div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn, userId } = useAuth();
  const { addItem } = useCart();
  const { openModal } = useItemModal();
  const { show } = useNotification();
  const [dishes, setDishes] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      const loadData = async () => {
        try {
          let myRest = null;
          if (userId) {
            console.log('Home - Buscando restaurante do owner:', userId);
            myRest = await api.getRestaurantByOwner(Number(userId)).catch(() => null);
            console.log('Home - Restaurante encontrado:', myRest);
          }

          if (myRest) {
            setRestaurantName(myRest.name);
            setRestaurantId(myRest.id);
            console.log('Home - restaurantId definido:', myRest.id);
            
            // Busca dados específicos do restaurante
            const [itemsRes, employeesRes] = await Promise.all([
               api.getFeaturedItemsByRestaurant(myRest.id),
               api.getEmployeesByRestaurant(myRest.id)
            ]);

            const itemsList = Array.isArray(itemsRes) ? itemsRes : (itemsRes?._embedded?.items || itemsRes?._embedded?.itemDTOList || []);
            console.log('Home - Items para "Pratos em alta":', itemsList);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const fixedItems = itemsList.map((item: any) => ({
              ...item,
              image: item.image && item.image.startsWith('/') ? `${apiUrl}${item.image}` : item.image
            }));
            setDishes(fixedItems.slice(0, 5));

            const employeesList = Array.isArray(employeesRes) ? employeesRes : (employeesRes?._embedded?.employees || []);
            setTeam(employeesList.slice(0, 4));
          } else {
            console.log('Home - Usuário não tem restaurante');
            // Fallback para dados globais (visitante/sem restaurante)
            const usersRes = await api.fetchUsers();
            const usersList = Array.isArray(usersRes) ? usersRes : (usersRes?._embedded?.users || []);
            setTeam(usersList.slice(0, 4));

            const allItems = await api.searchItems('');
            const list = Array.isArray(allItems) ? allItems : [];
            setDishes(list.slice(0, 5));
          }
        } catch (e) { console.error(e); }
      };
      loadData();
    }
  }, [isLoggedIn, userId]);

  if (isLoggedIn) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroBanner}>
              <h1>Bem-vindo a {restaurantName || 'Menu4You'}! </h1>
            </div>
          </section>

          {restaurantId ? (
            <>
              {console.log('Home - Renderizando CategoryItemsSection com restaurantId:', restaurantId)}
              <CategoryItemsSection restaurantId={restaurantId} />
            </>
          ) : (
            console.log('Home - restaurantId é null, não renderizando CategoryItemsSection')
          )}

          <section>
            <h2 className={styles.sectionTitle}>Pratos em alta</h2>
            <p style={{ textAlign: 'center', color: '#666', marginTop: '-0.75rem', marginBottom: '1rem' }}>Selecionados manualmente no dashboard (máx. 5).</p>
            <div className={styles.dishGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {dishes.length === 0 ? <p className={styles.emptyState}>Nenhum prato marcado como em alta.</p> : dishes.map((dish) => (
                <div 
                  key={dish.id} 
                  className={styles.dishCard}
                  onClick={() => openModal(dish)}
                >
                  <div className={styles.imagePlaceholder} style={{ backgroundImage: dish.image ? `url(${dish.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', height: '140px' }} />
                  <div className={styles.cardInfo}>
                    <h3>{dish.name}</h3>
                    <p>R$ {Number(dish.price).toFixed(2).replace('.', ',')}</p>
                  </div>
                  <button className={styles.cardButton} onClick={(e) => {
                    e.stopPropagation();
                    addItem({ itemId: dish.id, name: dish.name, price: Number(dish.price), quantity: 1 });
                    show('Adicionado ao carrinho', 'info');
                  }}>Pedir</button>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: '4rem' }}>
            <h2 className={styles.sectionTitle}>Conheça nossa equipe</h2>
            <div className={styles.teamGrid}>
              {team.length === 0 ? <p className={styles.emptyState}>Nenhum membro encontrado.</p> : team.map((member, index) => (
                <div key={member.id} className={styles.teamCard}>
                  <div className={styles.memberAvatar} style={{ backgroundImage: (member.image || member.avatar) ? `url(${member.image || member.avatar})` : undefined }}>
                    {!(member.image || member.avatar) && ((member.name || member.username)?.charAt(0).toUpperCase() || 'U')}
                  </div>
                  <div className={styles.memberInfo}>
                    <h3>{member.name || member.username}</h3>
                    <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', fontWeight: 700 }}>
                      {member.role || ['Chef de Cozinha', 'Sommelier', 'Gerente', 'Maitre'][index % 4]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>

        <section className={styles.hero}>
          <div className={styles.heroBanner}>
            <h1>Cardápio digital</h1>
            <p>Simplifique o atendimento, elimine cardápios físicos e aumente suas vendas.</p>
            <div style={{ marginTop: '2rem' }}>
              <button 
                className={styles.cardButton} 
                style={{ maxWidth: '200px', margin: '0 auto', display: 'block' }}
                onClick={() => navigate('/login')}
              >
                Começar Agora
              </button>
            </div>
          </div>
        </section>

        <HowItWorksSection />

        <section style={{ background: 'var(--brand-deep)', color: 'white', padding: '4rem 2rem', borderRadius: '40px', textAlign: 'center', margin: '4rem 0' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Pronto para modernizar?</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>Junte-se a centenas de restaurantes que já estão usando o Menu4You.</p>
          <button 
            style={{ 
              background: 'var(--brand-accent)', 
              color: 'white', 
              border: 'none', 
              padding: '1rem 2rem', 
              borderRadius: '99px', 
              fontSize: '1rem', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}
            onClick={() => navigate('/cadastro')}
          >
            Criar meu Restaurante
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
