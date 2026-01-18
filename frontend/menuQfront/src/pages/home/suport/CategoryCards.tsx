import { Link } from 'react-router-dom';
import styles from './CategoryCards.module.css';

export const categories = [
  { id: 'lanches', name: 'Lanches', emoji: '🍔', color: '#FFD700' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', color: '#FF6B6B' },
  { id: 'japonesa', name: 'Japonesa', emoji: '🍣', color: '#FF9F43' },
  { id: 'brasileira', name: 'Brasileira', emoji: '🥘', color: '#54a0ff' },
  { id: 'saudavel', name: 'Saudável', emoji: '🥗', color: '#1dd1a1' },
  { id: 'doces', name: 'Doces', emoji: '🍩', color: '#ff9ff3' },
  { id: 'bebidas', name: 'Bebidas', emoji: '🥤', color: '#00d2d3' },
  { id: 'acai', name: 'Açaí', emoji: '🍇', color: '#5f27cd' },
];

interface CategoryCardsProps {
  activeIds?: string[];
}

export default function CategoryCards({ activeIds }: CategoryCardsProps) {
  const visible = activeIds && activeIds.length > 0 
    ? categories.filter(cat => activeIds.includes(cat.id)) 
    : categories;

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>O que você quer comer hoje?</h2>
      <div className={styles.grid}>
        {visible.map((cat) => (
          <Link 
            to={`/category/${cat.id}`} 
            key={cat.id} 
            className={styles.card}
            style={{ '--card-color': cat.color } as React.CSSProperties}
          >
            <span className={styles.emoji}>{cat.emoji}</span>
            <span className={styles.name}>{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}