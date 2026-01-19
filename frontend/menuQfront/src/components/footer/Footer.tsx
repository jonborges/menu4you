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
            <span>Sobre Nós</span>
            <span>Restaurantes</span>
          </section>

          <section aria-label="Suporte">
            <h3>Suporte</h3>
            <span>Contato</span>
            <span>Termos de Serviço</span>
            <span>Privacidade</span>
          </section>

          <section aria-label="Social">
            <h3>Social</h3>
            <span>Instagram</span>
            <span>TikTok</span>
          </section>
        </div>

      </div>

    </footer>
  );
}
