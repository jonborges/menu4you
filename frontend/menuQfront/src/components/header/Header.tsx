import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as api from '../../services/api';
import styles from './Header.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';

interface HeaderProps {
  simple?: boolean;
}

export default function Header({ simple }: HeaderProps) {
  const { isLoggedIn, logout, userId } = useAuth();
  const { isSidebarOpen, openSidebar, closeSidebar, isOffline } = useUI();
  const navigate = useNavigate();
  
  const [myRestaurantId, setMyRestaurantId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!userId) { setMyRestaurantId(null); return; }
    if (isOffline) return;
    api.getRestaurantByOwner(userId).then((res:any) => {
      if (!mounted) return;
      if (res && (res.id || res.id === 0)) {
        setMyRestaurantId(res.id);
      } else setMyRestaurantId(null);
    }).catch(() => setMyRestaurantId(null));
    return () => { mounted = false; };
  }, [userId, isOffline]);

  useEffect(() => {
    const onCreated = (e: any) => {
      try {
        const id = e?.detail?.id;
        if (id) setMyRestaurantId(id);
      } catch (e) { /* ignore */ }
    };
    window.addEventListener('restaurantCreated', onCreated as EventListener);
    return () => { window.removeEventListener('restaurantCreated', onCreated as EventListener); };
  }, []);

  return (
    <header className={styles.container} role="banner">
      
      <div className={styles.logo}>
        <Link to="/" aria-label="Página inicial do Menu4You">
          <h1>Menu4You</h1>
        </Link>
      </div>

      {!simple && (
        <>
          <div className={styles.actions}>
            {isLoggedIn ? (
              <>
                <div className={styles.profileWrapper}>
                  <button className={styles.profileButton} onClick={openSidebar} aria-label="Abrir menu">
                    Perfil 
                  </button>
                  
                  <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                    <div className={styles.sidebarHeader}>
                      <h2>Menu</h2>
                      <button onClick={closeSidebar} className={styles.closeSidebar}>X</button>
                    </div>
                    <nav className={styles.sidebarNav}>
                      {myRestaurantId ? (
                        <>
                          <Link to="/owner/dashboard" onClick={closeSidebar}>Meu Restaurante</Link>
                          <button 
                            onClick={() => {
                              const randomTable = Math.floor(Math.random() * 10) + 1;
                              navigate(`/menu/${myRestaurantId}/mesa/${randomTable}`);
                              closeSidebar();
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#1a3a32',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              padding: '0.75rem 0',
                              textAlign: 'left',
                              fontWeight: 500
                            }}
                          >
                            🎲 Acessar Mesa Aleatória
                          </button>
                        </>
                      ) : (
                        <Link to="/restaurants/create" onClick={closeSidebar}>Criar Restaurante</Link>
                      )}
                      <button onClick={() => { logout(); closeSidebar(); }} style={{ background: 'none', border: 'none', color: '#1a3a32', cursor: 'pointer', fontSize: '1rem', padding: '0.75rem 0', textAlign: 'left', fontWeight: 500 }}>
                        Sair
                      </button>
                    </nav>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.loginLink}>Entrar</Link>
                <Link to="/cadastro" className={styles.signupButton}>Cadastrar</Link>
              </>
            )}
          </div>
        </>
      )}

      {isOffline && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#ff9800', color: '#fff', padding: '0.5rem', textAlign: 'center', fontSize: '0.9rem', zIndex: 9999 }}>
          ⚠️ Sem conexão com a internet
        </div>
      )}
    </header>
  );
}
