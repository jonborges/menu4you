import { createContext, useContext, useState, type ReactNode } from 'react';

type Toast = { id: number; message: string; kind?: 'info' | 'warning' | 'error' };

interface NotificationContextType {
  show: (message: string, kind?: Toast['kind'], duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = (message: string, kind: Toast['kind'] = 'info', duration = 2000) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const t: Toast = { id, message, kind };
    setToasts(s => [t, ...s]);
    setTimeout(() => setToasts(s => s.filter(x => x.id !== id)), duration);
  };

  return (
    <NotificationContext.Provider value={{ show }}>
      {children}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <style>{`
          @keyframes toastIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes toastOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-6px) scale(0.98); } }
          .mq-toast { transition: opacity 120ms linear; animation: toastIn 180ms ease forwards; }
        `}</style>
        {toasts.map(t => (
          <div key={t.id} className="mq-toast" style={{
            maxWidth: 320,
            padding: '10px 14px',
            background: '#ffffff',
            color: '#1a1a1a',
            borderRadius: 12,
            border: '3px solid #1a1a1a',
            boxShadow: '4px 4px 0px rgba(26,26,26,1)',
            fontFamily: 'inherit',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingLeft: 12,
          }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, flex: '0 0 14px', background: t.kind === 'error' ? '#254a7a' : t.kind === 'warning' ? '#b45309' : '#4A90E2', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.12)' }} />
            <div style={{ flex: 1, fontSize: 14 }}>{t.message}</div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}

export default NotificationContext;
