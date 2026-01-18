import React, { createContext, useContext, useState, type ReactNode } from 'react';
import * as api from '../services/api';

export type CartItem = {
  itemId: number;
  name: string;
  price: number;
  quantity: number;
  restaurantId?: number;
};

type CartContextType = {
  items: CartItem[];
  tableNumber: number | null;
  addItem: (it: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQty: (itemId: number, qty: number) => void;
  clear: () => void;
  total: () => number;
  checkout: (userId: number | null, guestName?: string) => Promise<any>;
  setTableNumber: (tableNum: number | null) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  // Verificar se tem mesa no localStorage ao iniciar
  React.useEffect(() => {
    const storedTable = localStorage.getItem('current_table_number');
    if (storedTable) {
      setTableNumber(parseInt(storedTable, 10));
    }
  }, []);

  const addItem = (it: CartItem) => {
    setItems(prev => {
      const found = prev.find(p => p.itemId === it.itemId);
      if (found) return prev.map(p => p.itemId === it.itemId ? { ...p, quantity: p.quantity + it.quantity } : p);
      return [...prev, it];
    });
  };

  const removeItem = (itemId: number) => setItems(prev => prev.filter(i => i.itemId !== itemId));
  const updateQty = (itemId: number, qty: number) => setItems(prev => prev.map(i => i.itemId === itemId ? { ...i, quantity: qty } : i));
  const clear = () => setItems([]);

  const total = () => items.reduce((s, i) => s + i.price * i.quantity, 0);

  const checkout = async (userId: number | null, guestName?: string) => {
    if (items.length === 0) throw new Error('Cart vazio');
    const restaurantId = items[0].restaurantId; // simple: assume single-restaurant cart
    const payload = {
      userId,
      restaurantId,
      tableNumber, // Incluir número da mesa no pedido
      items: items.map(i => ({ itemId: i.itemId, quantity: i.quantity })),
      guestName
    };
    const res = await api.createOrder(payload);
    clear();
    // Limpar mesa do localStorage após finalizar pedido
    localStorage.removeItem('current_table_number');
    localStorage.removeItem('current_restaurant_id');
    setTableNumber(null);
    return res;
  };

  return (
    <CartContext.Provider value={{ items, tableNumber, addItem, removeItem, updateQty, clear, total, checkout, setTableNumber }}>
      {children}
    </CartContext.Provider>
  );
}
