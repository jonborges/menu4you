import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Pencil, Star } from 'lucide-react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import styles from './RestaurantDashboard.module.css';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { categories } from '../home/suport/CategoryCards';
import { QRCodeGenerator } from '../../components/qrcode/QRCodeGenerator';

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { show } = useNotification();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  // restaurant edit state
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantDesc, setRestaurantDesc] = useState('');
  const [restaurantCover, setRestaurantCover] = useState('');
  const [visibleCats, setVisibleCats] = useState<string[]>([]);
  // add-item form state (kept separate so forms don't sync)
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState<number | ''>('');
  const [itemCategory, setItemCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [loadingOwner, setLoadingOwner] = useState(true);
  
  // orders state
  const [orders, setOrders] = useState<any[]>([]);
  
  // employee state
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empImage, setEmpImage] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // try to render quickly from cache while fetching fresh data
        if (!mounted) return;
        if (userId) {
          setLoadingOwner(true);
          const mine = await api.getRestaurantByOwner(userId).catch(() => null);
          if (mine) {
            if (!mounted) return;
            // Corrigir URL da capa se for relativa
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const fixedCover = mine.cover && mine.cover.startsWith('/') ? `${apiUrl}${mine.cover}` : mine.cover;
            const fixedRestaurant = { ...mine, cover: fixedCover };
            setRestaurants([fixedRestaurant]);
            setSelected(mine.id);
            setRestaurantName(mine.name || '');
            setRestaurantDesc(mine.description || '');
            setRestaurantCover(mine.cover || '');
            if (mine.visibleCategories) setVisibleCats(mine.visibleCategories.split(','));
            setEditingRestaurant(false);
            setLoadingOwner(false);
            return;
          } else {
            if (mounted) {
              setRestaurants([]);
              setSelected(null);
            }
          }
          if (mounted) setLoadingOwner(false);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
    return () => { mounted = false; };
  }, [userId]);

  useEffect(() => {
    // reset add-item form when restaurant selection changes
    resetItemForm();
    if (!selected) { setItems([]); setEmployees([]); setOrders([]); return; }
    let mounted = true;
    api.getItemsByRestaurant(selected).then(res => { 
      if (!mounted) return; 
      const list = Array.isArray(res) ? res : (res?._embedded?.items || res?._embedded?.itemDTOList || []);
      // Corrigir URLs relativas para absolutas
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const fixedList = list.map((item: any) => ({
        ...item,
        image: item.image && item.image.startsWith('/') ? `${apiUrl}${item.image}` : item.image
      }));
      setItems(fixedList); 
    }).catch(console.error);

    api.getEmployeesByRestaurant(selected).then(res => {
      if (!mounted) return;
      const list = Array.isArray(res) ? res : (res?._embedded?.employees || []);
      setEmployees(list);
    }).catch(console.error);

    // Carregar pedidos do restaurante
    api.getOrdersByRestaurant(selected).then(res => {
      if (!mounted) return;
      const list = Array.isArray(res) ? res : (res?._embedded?.orders || []);
      setOrders(list);
    }).catch(console.error);

    return () => { mounted = false; };
  }, [selected]);

  const resetItemForm = () => {
    setItemName(''); setItemDesc(''); setItemPrice(''); setItemCategory('');
    setEditingItemId(null);
  };

  const handleCreateItem = async () => {
    if (!selected || !userId) {
      show('Selecione um restaurante e faça login para continuar.', 'warning');
      return;
    }
    if (!itemName || !itemPrice || !itemCategory) { show('Preencha nome, preço e categoria', 'warning'); return; }
    
    setLoading(true);
    try {
      const payload = {
        name: itemName,
        description: itemDesc,
        price: Number(itemPrice),
        category: itemCategory,
        userId: Number(userId),
        restaurantId: Number(selected),
      };
      
      if (editingItemId) {
        await api.updateItem(editingItemId, payload);
        show('Item atualizado', 'info');
      } else {
        await api.createItem(payload);
        show('Item criado', 'info');
      }

      // Corrigir URLs relativas para absolutas
      const res = await api.getItemsByRestaurant(selected);
      const list = Array.isArray(res) ? res : (res?._embedded?.items || res?._embedded?.itemDTOList || []);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const fixedList = list.map((item: any) => ({
        ...item,
        image: item.image && item.image.startsWith('/') ? `${apiUrl}${item.image}` : item.image
      }));
      setItems(fixedList);
      resetItemForm();
    } catch (e: any) {
      console.error(e);
      let msg = 'Erro ao salvar item';
      try {
        // Tenta ler a mensagem de erro JSON do backend
        const jsonError = JSON.parse(e.message);
        if (jsonError.error) msg = jsonError.error;
      } catch {
        if (e.message) msg = e.message;
      }
      if (msg.includes('Restaurant not found')) {
        msg = 'Dados dessincronizados. Recarregue a página (F5).';
      } else if (msg.includes('foreign key constraint fails')) {
        msg = 'Erro de banco de dados. Tente clicar em "🔧 Corrigir DB" acima.';
      }
      show(msg, 'error');
    } finally { setLoading(false); }
  };

  const resetEmployeeForm = () => { setEmpName(''); setEmpRole(''); setEmpImage(''); setEditingEmployeeId(null); };

  const handleSimulateOrder = async () => {
    if (!selected || !userId) {
      show('Nenhum restaurante selecionado', 'warning');
      return;
    }

    if (items.length === 0) {
      show('Cadastre ao menos um item primeiro', 'warning');
      return;
    }

    const ownerRestaurant = restaurants.find((r: any) => r.id === selected);
    const tableCount = ownerRestaurant?.tableCount || 10;

    try {
      // Escolhe um item aleatório
      const randomItem = items[Math.floor(Math.random() * items.length)];
      // Escolhe uma mesa aleatória (1 até tableCount)
      const randomTable = Math.floor(Math.random() * tableCount) + 1;
      // Quantidade aleatória (1-3)
      const randomQty = Math.floor(Math.random() * 3) + 1;

      const payload = {
        userId: userId,
        restaurantId: selected,
        tableNumber: randomTable,
        items: [
          {
            itemId: randomItem.id,
            quantity: randomQty
          }
        ]
      };

      await api.createOrder(payload);
      show(`✅ Pedido simulado criado! Mesa ${randomTable} - ${randomQty}x ${randomItem.name}`, 'info');
      
      // Recarregar pedidos após criar
      const updatedOrders = await api.getOrdersByRestaurant(selected);
      const list = Array.isArray(updatedOrders) ? updatedOrders : (updatedOrders?._embedded?.orders || []);
      setOrders(list);
    } catch (e) {
      console.error(e);
      show('Erro ao simular pedido', 'error');
    }
  };

  const handleCreateEmployee = async () => {
    if (!selected) return;
    if (!empName || !empRole) { show('Preencha nome e função', 'warning'); return; }
    setLoading(true);
    try {
      if (editingEmployeeId) {
        await api.updateEmployee(editingEmployeeId, { name: empName, role: empRole, image: empImage });
        show('Membro atualizado', 'info');
      } else {
        await api.createEmployee({ name: empName, role: empRole, image: empImage, restaurantId: selected });
        show('Membro adicionado', 'info');
      }
      const res = await api.getEmployeesByRestaurant(selected);
      setEmployees(Array.isArray(res) ? res : (res?._embedded?.employees || []));
      resetEmployeeForm();
    } catch(e) { console.error(e); show('Erro ao salvar membro', 'error'); }
    finally { setLoading(false); }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (deleteConfirm === id) {
      try {
        await api.deleteEmployee(id);
        setEmployees(prev => prev.filter(e => e.id !== id));
        show('Funcionário removido', 'info');
      } catch (e) {
        console.error(e);
        show('Erro ao remover funcionário', 'error');
      } finally { setDeleteConfirm(null); }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000); // Reseta após 3s se não confirmar
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (deleteItemConfirm === id) {
      try {
        await api.deleteItem(id);
        setItems(prev => prev.filter(i => i.id !== id));
        show('Item removido', 'info');
      } catch (e) {
        console.error(e);
        show('Erro ao remover item', 'error');
      } finally { setDeleteItemConfirm(null); }
    } else {
      setDeleteItemConfirm(id);
      setTimeout(() => setDeleteItemConfirm(null), 3000);
    }
  };

  const handleUpdateRestaurant = async () => {
  if (!selected) {
    show('Selecione um restaurante', 'warning');
    return;
  }

  try {
    const payload = {
      name: restaurantName,
      description: restaurantDesc,
      cover: restaurantCover,
      visibleCategories: visibleCats.join(','),
    };

    const updated = await api.updateRestaurantById(selected, payload);

    show('Restaurante atualizado', 'info');
    setEditingRestaurant(false);

    setRestaurants([updated]);
  } catch (e) {
    console.error(e);
    const msg = (e as Error)?.message || 'Erro ao atualizar restaurante';
    show(msg, 'error');
  }
};

  const toggleCategory = (catId: string) => {
    setVisibleCats(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const ownerExists = restaurants.length === 1 && restaurants[0] && restaurants[0].owner && Number(restaurants[0].owner.id) === Number(userId);
  const ownerRestaurant = ownerExists ? restaurants[0] : null;

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <main className={styles.container}>

        {loadingOwner ? (
          <div className={styles.headerSection}>
            <div className={styles.coverImage} style={{ height: 180, backgroundColor: '#eee' }} />
            <div className={styles.restaurantInfo}>
              <div className={styles.skeleton} style={{ width: '60%', margin: '0 auto 1rem', height: 40 }} />
              <div className={styles.skeleton} style={{ width: '40%', margin: '0 auto' }} />
            </div>
          </div>
        ) : ownerExists && ownerRestaurant ? (
          <>
            {/* Cabeçalho do Restaurante */}
            <div className={styles.headerSection}>
              <div 
                className={styles.coverImage} 
                style={{ backgroundImage: ownerRestaurant.cover ? `url(${ownerRestaurant.cover})` : undefined }}
              >
                {!ownerRestaurant.cover && 'CAPA'}
              </div>
              <div className={styles.restaurantInfo}>
                <h1 className={styles.restaurantName}>{ownerRestaurant.name}</h1>
                <p className={styles.restaurantDesc}>{ownerRestaurant.description || 'Sem descrição definida.'}</p>
                
                <div className={styles.actionsRow}>
                  <button className={styles.btnSecondary} onClick={() => setEditingRestaurant(!editingRestaurant)}>
                    {editingRestaurant ? 'Cancelar Edição' : 'Editar Dados'}
                  </button>
                  <button className={styles.btnPrimary} onClick={handleSimulateOrder} title="Criar um pedido de teste">
                    🎲 Simular Pedido
                  </button>
                </div>
              </div>
            </div>

            {/* Formulário de Edição */}
            {editingRestaurant && (
              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Editar Informações</h2>
                <div className={styles.formGroup}>
                  <label>Nome do Restaurante</label>
                  <input className={styles.input} value={restaurantName} onChange={e => setRestaurantName(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>Descrição</label>
                  <input className={styles.input} value={restaurantDesc} onChange={e => setRestaurantDesc(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>Capa do Restaurante</label>
                  <select 
                    className={styles.select} 
                    value={restaurantCover} 
                    onChange={e => setRestaurantCover(e.target.value)}
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
                
                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                  <label>Categorias Visíveis na Home</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          border: `2px solid ${visibleCats.includes(cat.id) ? 'var(--brand-accent)' : '#eee'}`,
                          background: visibleCats.includes(cat.id) ? 'var(--brand-accent)' : 'white',
                          color: visibleCats.includes(cat.id) ? 'white' : '#666',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        {cat.emoji} {cat.name}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                    Selecione quais categorias aparecerão na seção "O que você quer comer hoje?" quando seu restaurante estiver ativo.
                  </p>
                </div>

                <button className={styles.btn} onClick={handleUpdateRestaurant}>Salvar Alterações</button>
              </div>
            )}

            {/* QR Codes das Mesas */}
            {ownerRestaurant.tableCount && ownerRestaurant.tableCount > 0 && (
              <QRCodeGenerator 
                restaurantId={ownerRestaurant.id}
                restaurantName={ownerRestaurant.name}
                tableCount={ownerRestaurant.tableCount}
                onTableCountChange={async (newCount) => {
                  try {
                    await api.updateRestaurant(ownerRestaurant.id, { 
                      name: ownerRestaurant.name,
                      description: ownerRestaurant.description,
                      cover: ownerRestaurant.cover,
                      visibleCategories: ownerRestaurant.visibleCategories,
                      tableCount: newCount
                    });
                    setRestaurants([{ ...ownerRestaurant, tableCount: newCount }]);
                    show(`Número de mesas atualizado para ${newCount}`, 'info');
                  } catch (e) {
                    console.error(e);
                    show('Erro ao atualizar número de mesas', 'error');
                  }
                }}
              />
            )}

            {/* Seção de Pedidos Recebidos */}
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>📋 Pedidos Recebidos</h2>
              
              {orders.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                  Nenhum pedido recebido. Clique em "🎲 Simular Pedido" para criar um pedido de teste.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {(Array.from(
                    orders.reduce((acc, order) => {
                      const tableNum = order.tableNumber || 0;
                      if (!acc.has(tableNum)) acc.set(tableNum, []);
                      acc.get(tableNum)!.push(order);
                      return acc;
                    }, new Map<number, any[]>())
                  ) as [number, any[]][]).sort((a, b) => a[0] - b[0])
                    .map(([table, tableOrders]) => (
                      <div key={table} style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '1rem',
                        backgroundColor: '#f9f9f9'
                      }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1a3a32' }}>
                          🪑 Mesa {table}
                        </div>
                        {tableOrders.map((order: any, idx: number) => (
                          <div key={order.id || idx} style={{
                            borderTop: idx > 0 ? '1px solid #ddd' : 'none',
                            paddingTop: idx > 0 ? '0.5rem' : '0',
                            marginTop: idx > 0 ? '0.5rem' : '0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '0.5rem'
                          }}>
                            <div style={{ flex: 1 }}>
                              {order.guestName && (
                                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                                  👤 Cliente: {order.guestName}
                                </div>
                              )}
                              {order.items && order.items.length > 0 ? (
                                <div>
                                  {order.items.map((item: any, itemIdx: number) => (
                                    <div key={itemIdx} style={{ fontSize: '0.9rem', color: '#333', margin: '0.25rem 0' }}>
                                      <strong>{item.quantity}x</strong> {item.name} - R$ {(Number(item.price) * item.quantity).toFixed(2)}
                                    </div>
                                  ))}
                                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #ddd', fontWeight: 'bold', color: '#f97316' }}>
                                    Total: R$ {Number(order.total).toFixed(2)}
                                  </div>
                                </div>
                              ) : (
                                <p style={{ color: '#999', fontSize: '0.85rem' }}>Sem itens</p>
                              )}
                            </div>
                            <button
                              onClick={async () => {
                                try {
                                  await api.deleteOrder(order.id);
                                  setOrders(prev => prev.filter(o => o.id !== order.id));
                                  show('✅ Pedido removido', 'info');
                                } catch (e) {
                                  console.error(e);
                                  show('Erro ao remover pedido', 'error');
                                }
                              }}
                              style={{
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                fontSize: '18px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                flexShrink: 0
                              }}
                              title="Fechar pedido"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Seção do Cardápio */}
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Cardápio</h2>
              
              {items.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                  Seu cardápio está vazio. Adicione itens abaixo.
                </p>
              ) : (
                <div className={styles.itemsGrid}>
                  {items.map(it => (
                    <div key={it.id} className={styles.itemCard} style={{ position: 'relative' }}>
                                            {/* Badge de destaque */}
                                            {it.featured && (
                                              <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                left: '10px',
                                                background: '#f59e0b',
                                                color: 'white',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                zIndex: 10,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                              }}>
                                                <Star size={12} fill="white" /> EM ALTA
                                              </div>
                                            )}
                      <div className={styles.cardActions}>
                                                <button
                                                  className={styles.actionBtn}
                                                  onClick={async () => {
                                                    const newFeatured = !it.featured;
                                                    // Contar quantos items já estão em destaque
                                                    const featuredCount = items.filter(i => i.featured && i.id !== it.id).length;
                            
                                                    if (newFeatured && featuredCount >= 5) {
                                                      show('Você já tem 5 pratos em destaque. Remova um para adicionar outro.', 'warning');
                                                      return;
                                                    }
                            
                                                    try {
                                                      await api.updateItem(it.id, { featured: newFeatured });
                                                      setItems(prev => prev.map(i => i.id === it.id ? { ...i, featured: newFeatured } : i));
                                                      show(newFeatured ? 'Prato adicionado aos destaques' : 'Prato removido dos destaques', 'info');
                                                    } catch (e) {
                                                      console.error(e);
                                                      show('Erro ao atualizar destaque', 'error');
                                                    }
                                                  }}
                                                  title={it.featured ? "Remover dos destaques" : "Adicionar aos destaques (Em Alta)"}
                                                  style={{ 
                                                    background: it.featured ? '#f59e0b' : 'transparent',
                                                    border: it.featured ? 'none' : '1px solid #e5e7eb'
                                                  }}
                                                >
                                                  <Star size={18} color={it.featured ? "#ffffff" : "#9ca3af"} fill={it.featured ? "#ffffff" : "none"} />
                                                </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => {
                            setEditingItemId(it.id);
                            setItemName(it.name);
                            setItemDesc(it.description || '');
                            setItemPrice(it.price);
                            setItemCategory(it.category || '');
                            document.getElementById('itemForm')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          title="Editar prato"
                        >
                          <Pencil size={18} color="#4b5563" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(it.id)}
                          className={`${styles.actionBtn} ${deleteItemConfirm === it.id ? styles.deleteBtnConfirm : ''}`}
                          title={deleteItemConfirm === it.id ? "Confirmar exclusão" : "Remover item"}
                        >
                          <Trash2 size={18} color={deleteItemConfirm === it.id ? "#ffffff" : "#4b5563"} />
                        </button>
                      </div>
                      <div 
                        className={styles.itemImage} 
                        style={{ backgroundImage: it.image ? `url(${it.image})` : undefined }} 
                      />
                      <div className={styles.itemInfo}>
                        <div className={styles.itemTitle}>{it.name}</div>
                        <div className={styles.itemDesc}>{it.description}</div>
                      </div>
                      <div className={styles.itemPrice}>R$ {Number(it.price).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulário de Adicionar Item */}
            <div className={styles.card} id="itemForm">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>{editingItemId ? 'Editar Prato' : 'Adicionar Novo Prato'}</h2>
              </div>
              <div className={styles.formGroup}>
                <label>Nome do Prato</label>
                <input className={styles.input} value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ex: X-Bacon" />
              </div>
              
              <div className={styles.formGroup}>
                <label>Categoria</label>
                <select className={styles.select} value={itemCategory} onChange={e => setItemCategory(e.target.value)}>
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  💡 A imagem do prato será automaticamente vinculada à categoria escolhida
                </small>
              </div>

              <div className={styles.formGroup}>
                <label>Descrição</label>
                <input className={styles.input} value={itemDesc} onChange={e => setItemDesc(e.target.value)} placeholder="Ingredientes, tamanho..." />
              </div>
              <div className={styles.formGroup}>
                <label>Preço (R$)</label>
                <input className={styles.input} type="number" value={itemPrice as any} onChange={e => setItemPrice(e.target.value ? Number(e.target.value) : '')} placeholder="0.00" />
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button className={styles.btn} onClick={handleCreateItem} disabled={loading}>
                  {loading ? 'Salvando...' : (editingItemId ? 'Salvar Alterações' : 'Adicionar ao Cardápio')}
                </button>
                <button className={styles.btnSecondary} onClick={resetItemForm}>
                  {editingItemId ? 'Cancelar' : 'Limpar'}
                </button>
              </div>
            </div>

            {/* Seção da Equipe */}
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Equipe do Restaurante</h2>
              
              {employees.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                  Nenhum funcionário cadastrado.
                </p>
              ) : (
                <div className={styles.itemsGrid}>
                  {employees.map(emp => (
                    <div key={emp.id} className={styles.itemCard} style={{ alignItems: 'center', position: 'relative' }}>
                      <div className={styles.cardActions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => {
                            setEditingEmployeeId(emp.id);
                            setEmpName(emp.name);
                            setEmpRole(emp.role);
                            setEmpImage(emp.image || '');
                            document.getElementById('empForm')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          title="Editar funcionário"
                        >
                          <Pencil size={18} color="#4b5563" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className={`${styles.actionBtn} ${deleteConfirm === emp.id ? styles.deleteBtnConfirm : ''}`}
                          title={deleteConfirm === emp.id ? "Confirmar exclusão" : "Remover funcionário"}
                        >
                          <Trash2 size={18} color={deleteConfirm === emp.id ? "#ffffff" : "#4b5563"} />
                        </button>
                      </div>
                      <div 
                        className={styles.itemImage} 
                        style={{ backgroundImage: emp.image ? `url(${emp.image})` : undefined, borderRadius: '50%', width: 80, height: 80 }} 
                      />
                      <div className={styles.itemInfo} style={{ textAlign: 'center' }}>
                        <div className={styles.itemTitle}>{emp.name}</div>
                        <div className={styles.itemDesc} style={{ color: '#f97316', fontWeight: 'bold', marginTop: '0.25rem' }}>{emp.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem' }} id="empForm">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1a3a32' }}>{editingEmployeeId ? 'Editar Membro' : 'Adicionar Membro'}</h3>
                <div className={styles.formGroup}>
                  <label>Nome</label>
                  <input className={styles.input} value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Ex: João Silva" />
                </div>
                <div className={styles.formGroup}>
                  <label>Função</label>
                  <input className={styles.input} value={empRole} onChange={e => setEmpRole(e.target.value)} placeholder="Ex: Chef de Cozinha" />
                </div>
                <div className={styles.formGroup}>
                  <label>Foto do Membro</label>
                  <select 
                    className={styles.select} 
                    value={empImage} 
                    onChange={e => setEmpImage(e.target.value)}
                  >
                    <option value="">Selecione um avatar</option>
                    <option value="employee_1">👤 Avatar 1</option>
                    <option value="employee_2">👤 Avatar 2</option>
                    <option value="employee_3">👤 Avatar 3</option>
                    <option value="employee_4">👤 Avatar 4</option>
                    <option value="employee_5">👤 Avatar 5</option>
                    <option value="employee_6">👤 Avatar 6</option>
                  </select>
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    💡 Escolha um avatar pré-definido para o funcionário
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className={styles.btn} onClick={handleCreateEmployee} disabled={loading}>
                    {editingEmployeeId ? 'Salvar Alterações' : 'Adicionar Membro'}
                  </button>
                  <button className={styles.btnSecondary} onClick={resetEmployeeForm}>
                    {editingEmployeeId ? 'Cancelar' : 'Limpar'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Você ainda não possui um restaurante</h2>
            <p style={{ marginBottom: '2rem', color: '#666' }}>Cadastre seu estabelecimento para começar a vender.</p>
            <button className={styles.btn} onClick={() => navigate('/restaurants/create')}>
              Criar Meu Restaurante
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
