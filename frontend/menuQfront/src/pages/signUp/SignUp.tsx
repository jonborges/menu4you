import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import styles from './signUp.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

export default function SignUp() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      const response = await api.register(
        formData.fullName || formData.email,
        formData.email,
        formData.password
      );
      
      // Faz login automático após registro
      login(response.token, response.userId, response.username, response.email);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      const message = err.message || 'Erro ao criar conta';
      alert(message);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header simple />
      
      <main className={styles.signUpContainer}>
        <div className={styles.signUpCard}>
          <h1 className={styles.title}>Crie sua Conta</h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
            Cadastre-se para criar seu restaurante e começar a usar cardápios digitais
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="fullName">Nome Completo</label>
              <input 
                type="text" 
                name="fullName" 
                id="fullName" 
                placeholder="João Silva"
                required 
                value={formData.fullName}
                onChange={handleChange} 
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                placeholder="seu@email.com"
                required 
                value={formData.email}
                onChange={handleChange} 
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Senha</label>
              <input 
                type="password" 
                name="password" 
                id="password" 
                placeholder="Mínimo 6 caracteres"
                required 
                value={formData.password}
                onChange={handleChange} 
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <input 
                type="password" 
                name="confirmPassword" 
                id="confirmPassword" 
                placeholder="Digite a senha novamente"
                required 
                value={formData.confirmPassword}
                onChange={handleChange} 
              />
            </div>

            <button type="submit" className={styles.signUpButton}>
              Criar Conta
            </button>
          </form>

          <div className={styles.linksContainer}>
            <Link to="/login" className={styles.link}>
              Já tem uma conta? Faça login
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}