import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import styles from './CreateRestaurant.module.css';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export default function CreateRestaurant() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { show } = useNotification();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      show('Você precisa estar logado.', 'warning');
      return;
    }
    if (!name) {
      show('O nome do restaurante é obrigatório.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.createRestaurant({
        name,
        description,
        cover,
        ownerId: Number(userId)
      });
      
      // Dispara evento para atualizar o Header
      window.dispatchEvent(new CustomEvent('restaurantCreated', { detail: { id: 0 } })); // ID 0 força refresh
      
      show('Restaurante criado com sucesso!', 'info');
      navigate('/owner/dashboard');
    } catch (error) {
      console.error(error);
      show('Erro ao criar restaurante.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <main className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Criar Restaurante</h1>
          <p className={styles.subtitle}>Comece sua jornada digital agora.</p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Nome do Estabelecimento</label>
              <input className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Pizzaria do João" />
            </div>
            <div className={styles.formGroup}>
              <label>Descrição Curta</label>
              <input className={styles.input} value={description} onChange={e => setDescription(e.target.value)} placeholder="A melhor pizza da cidade..." />
            </div>
            <div className={styles.formGroup}>
              <label>Capa do Restaurante</label>
              <select 
                className={styles.input} 
                value={cover} 
                onChange={e => setCover(e.target.value)}
              >
                <option value="">Selecione uma capa</option>
                <option value="cover_restaurant_1.jpg">Capa 1 - Moderna/Elegante</option>
                <option value="cover_restaurant_2.jpg">Capa 2 - Casual/Aconchegante</option>
                <option value="cover_restaurant_3.jpg">Capa 3 - Temática</option>
                <option value="cover_restaurant_4.jpg">Capa 4 - Fast-food/Delivery</option>
              </select>
              <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                💡 Escolha uma das capas pré-definidas para seu restaurante
              </small>
            </div>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Criando...' : 'Cadastrar Restaurante'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}