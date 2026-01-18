import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface Item {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  restaurantId?: number;
  [key: string]: any;
}

interface ItemModalContextType {
  isOpen: boolean;
  selectedItem: Item | null;
  restaurantId: number | null;
  openModal: (item: Item, restaurantId?: number) => void;
  closeModal: () => void;
}

const ItemModalContext = createContext<ItemModalContextType | undefined>(undefined);

export function ItemModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  const openModal = (item: Item, rId?: number) => {
    setSelectedItem(item);
    setRestaurantId(rId ?? item.restaurantId ?? null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedItem(null);
    setRestaurantId(null);
  };

  return (
    <ItemModalContext.Provider value={{ isOpen, selectedItem, restaurantId, openModal, closeModal }}>
      {children}
    </ItemModalContext.Provider>
  );
}

export function useItemModal() {
  const context = useContext(ItemModalContext);
  if (!context) {
    throw new Error('useItemModal must be used within an ItemModalProvider');
  }
  return context;
}