import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box } from '@mui/material';
import Navbar from './components/Navbar';
import AuctionList from './components/AuctionList';
import WalletView from './components/WalletView';
import AuditView from './components/AuditView';
import AdminPanel from './components/AdminPanel';
import { getWallet } from './services/api';
import './App.css';

// HOOK DE NOTIFICACIONES FLOTANTES ESTILO TICKETSYS
function useNotif() {
  const [lista, setLista] = useState([]);
  const push = useCallback((tipo, titulo, mensaje) => {
    const id = crypto.randomUUID();
    setLista((p) => [...p, { id, tipo, titulo, mensaje }]);
    setTimeout(() => {
      setLista((p) => p.map((n) => (n.id === id ? { ...n, saliendo: true } : n)));
      setTimeout(() => setLista((p) => p.filter((n) => n.id !== id)), 280);
    }, 4200);
  }, []);
  return { lista, push };
}

function Notificaciones({ lista }) {
  const iconos = { exito: '✓', error: '✕', aviso: '⚠', info: 'ℹ' };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        pointerEvents: 'none',
        width: 320,
      }}
    >
      {lista.map((n) => (
        <Box
          key={n.id}
          className={`toast-in ${n.saliendo ? 'toast-out' : ''}`}
          sx={{
            pointerEvents: 'auto',
            display: 'flex',
            gap: 1.5,
            p: 2,
            borderRadius: 2,
            fontSize: '0.85rem',
            backgroundColor: 'rgba(19,11,16,0.96)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${n.tipo === 'exito' ? '#22c55e' : n.tipo === 'error' ? '#ef4444' : '#c9a84c'}`,
            color: '#f0e8dc',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
          }}
        >
          <Typography sx={{ fontWeight: 'bold', color: n.tipo === 'exito' ? '#4ade80' : n.tipo === 'error' ? '#fca5a5' : '#c9a84c' }}>
            {iconos[n.tipo]}
          </Typography>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#f0e8dc', leading: 1.2 }}>
              {n.titulo}
            </Typography>
            <Typography sx={{ opacity: 0.8, fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>
              {n.mensaje}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function App() {
  const [activeUser, setActiveUser] = useState(2); // Comprador 1 por defecto (Ana García)
  const [wallet, setWallet] = useState(null);
  const [currentTab, setCurrentTab] = useState('auctions');
  const { lista: notifs, push: pushNotif } = useNotif();

  const refreshWallet = async () => {
    try {
      const data = await getWallet(activeUser);
      setWallet(data);
    } catch (err) {
      console.error('Error al obtener billetera:', err);
    }
  };

  useEffect(() => {
    refreshWallet();
  }, [activeUser]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#09050a', color: '#f0e8dc' }}>
      {/* Sistema de Notificaciones Flotante */}
      <Notificaciones lista={notifs} />

      {/* Barra de Navegación con diferenciación de Rol Admin vs Comprador */}
      <Navbar 
        activeUser={activeUser} 
        setActiveUser={setActiveUser} 
        wallet={wallet} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
      />

      {/* Contenido Principal */}
      <Container maxWidth="lg">
        {currentTab === 'auctions' && (
          <AuctionList 
            activeUserId={activeUser} 
            onBidSuccess={refreshWallet} 
            pushNotif={pushNotif}
          />
        )}

        {currentTab === 'wallet' && (
          <WalletView 
            wallet={wallet} 
            activeUserId={activeUser} 
            onWalletUpdated={refreshWallet} 
            pushNotif={pushNotif}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel 
            onAuctionCreated={() => {
              pushNotif('exito', 'Catálogo Actualizado', 'Subasta publicada en el sistema.');
            }}
            pushNotif={pushNotif}
          />
        )}

        {currentTab === 'audit' && (
          <AuditView />
        )}
      </Container>
    </Box>
  );
}

export default App;
