import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import styles from './Login.module.css';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.loginUser(username, password);
      login(response.token, response.userId, response.username, response.email);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header simple />
      
      <main className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1 className={styles.title}>Login</h1>

          <form className={styles.form} onSubmit={handleLogin}>
            {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            
            <div className={styles.inputGroup}>
              <label htmlFor="username">Usuário ou Email</label>
              <input
                type="text"
                id="username"
                className={styles.input}
                placeholder="Seu nome ou email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                className={styles.input}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className={styles.linksContainer}>
            <Link to="/esqueci-senha" className={styles.link}>
              Esqueceu sua senha?
            </Link>
            <Link to="/cadastro" className={styles.link}>
              Não tem uma conta? Cadastre-se
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}