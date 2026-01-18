import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.container} role="contentinfo">
      <div className={styles.content}>

        <div className={styles.brand}>
          <h2>Menu4You</h2>
          <p className={styles.copyright}>&copy; {currentYear} Menu2You. Todos os direitos reservados.</p>
        </div>

        <div className={styles.navSections}>
          <section aria-label="Institucional">
            <h3>Institucional</h3>
            <Link to="/sobre">Sobre Nós</Link>
            <Link to="/restaurantes">Restaurantes</Link>
          </section>

          <section aria-label="Suporte">
            <h3>Suporte</h3>
            <Link to="/contato">Contato</Link>
            <Link to="/termos">Termos de Serviço</Link>
            <Link to="/privacidade">Privacidade</Link>
          </section>

          <section aria-label="Social">
            <h3>Social</h3>
            <a href="#" aria-label="Menu2You no Instagram">Instagram</a>
            <a href="#" aria-label="Menu2You no TikTok">TikTok</a>
          </section>
        </div>

      </div>

    </footer>
  );
}
