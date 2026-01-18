
import React, { useState } from 'react';

interface GuestInfoModalProps {
  onSubmit: (name: string) => void;
}

export default function GuestInfoModal({ onSubmit }: GuestInfoModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName && lastName) {
      onSubmit(`${firstName} ${lastName}`);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        backgroundColor: 'white', padding: '2rem', borderRadius: '24px',
        width: '90%', maxWidth: '400px', textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#1a3a32', marginBottom: '1rem' }}>Bem-vindo!</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Para realizar seu pedido, por favor identifique-se.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            placeholder="Nome" 
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
          />
          <input 
            placeholder="Sobrenome" 
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
          />
          <button 
            type="submit"
            style={{
              background: '#1a3a32', color: 'white', border: 'none',
              padding: '1rem', borderRadius: '50px', fontWeight: 'bold',
              fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem'
            }}
          >
            Acessar Cardápio
          </button>
        </form>
      </div>
    </div>
  );
}
