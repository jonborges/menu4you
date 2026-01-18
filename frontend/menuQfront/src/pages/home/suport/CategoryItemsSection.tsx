import { useState, useEffect } from 'react';
import styles from './CategoryItemsSection.module.css';
import { categories } from './CategoryCards';
import * as api from '../../../services/api';
import { useItemModal } from '../../../contexts/ItemModalContext';

interface Item {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  restaurantId: number;
}

interface CategoryItemsSectionProps {
  restaurantId: number;
}

export default function CategoryItemsSection({ restaurantId }: CategoryItemsSectionProps) {
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, Item[]>>({});
  const [loading, setLoading] = useState(true);
  const { openModal } = useItemModal();

  useEffect(() => {
    const loadItems = async () => {
      try {
        const itemsRes = await api.getItemsByRestaurant(restaurantId);
        const itemsList: Item[] = Array.isArray(itemsRes) 
          ? itemsRes 
          : (itemsRes?._embedded?.items || itemsRes?._embedded?.itemDTOList || []);

        // Converter URLs relativas para absolutas
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const fixedItems = itemsList.map(item => ({
          ...item,
          image: item.image && item.image.startsWith('/') ? `${apiUrl}${item.image}` : item.image
        }));

        console.log('CategoryItemsSection - Items carregados:', fixedItems);
        console.log('CategoryItemsSection - Categorias dos items:', fixedItems.map(i => ({ name: i.name, category: i.category })));

        // Agrupar items por categoria
        const grouped: Record<string, Item[]> = {};
        fixedItems.forEach(item => {
          const cat = item.category || 'outros';
          if (!grouped[cat]) {
            grouped[cat] = [];
          }
          grouped[cat].push(item);
        });

        console.log('CategoryItemsSection - Items agrupados:', grouped);
        setItemsByCategory(grouped);
      } catch (e) {
        console.error('Erro ao carregar items:', e);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [restaurantId]);

  if (loading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>O que você quer comer hoje?</h2>
        <p className={styles.loading}>Carregando cardápio...</p>
      </section>
    );
  }

  // Criar lista de categorias incluindo "outros" se houver items sem categoria
  const allCategories = [...categories];
  if (itemsByCategory['outros'] && itemsByCategory['outros'].length > 0) {
    allCategories.push({ id: 'outros', name: 'Outros', emoji: '🍽️', color: '#999999' });
  }

  // Filtrar apenas categorias que têm items
  const categoriesWithItems = allCategories.filter(cat => 
    itemsByCategory[cat.id] && itemsByCategory[cat.id].length > 0
  );

  console.log('CategoryItemsSection - Categorias com items:', categoriesWithItems.map(c => c.id));

  if (categoriesWithItems.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>O que você quer comer hoje?</h2>
        <p className={styles.empty}>Nenhum prato cadastrado ainda.</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>O que você quer comer hoje?</h2>
      
      <div className={styles.categoriesContainer}>
        {categoriesWithItems.map(category => {
          const items = itemsByCategory[category.id] || [];
          
          return (
            <div key={category.id} className={styles.categoryRow}>
              {/* Card da Categoria à Esquerda */}
              <div className={styles.categoryCard}>
                <div className={styles.categoryEmoji}>{category.emoji}</div>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <p className={styles.categoryCount}>
                  {items.length} {items.length === 1 ? 'prato' : 'pratos'}
                </p>
              </div>

              {/* Items à Direita */}
              <div className={styles.itemsGrid}>
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className={styles.itemCard}
                    onClick={() => openModal(item, restaurantId)}
                  >
                    <div 
                      className={styles.itemImage}
                      style={{ 
                        backgroundImage: item.image ? `url(${item.image})` : undefined 
                      }}
                    >
                      {!item.image && <span className={styles.noImage}>🍽️</span>}
                    </div>
                    
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>{item.name}</h4>
                      {item.description && (
                        <p className={styles.itemDescription}>{item.description}</p>
                      )}
                      <div className={styles.itemFooter}>
                        <span className={styles.itemPrice}>
                          R$ {Number(item.price).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
