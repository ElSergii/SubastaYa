import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box } from '@mui/material';
import Navbar from './components/Navbar';
import AuctionList from './components/AuctionList';
import WalletView from './components/WalletView';
import AuditView from './components/AuditView';
import AdminPanel from './components/AdminPanel';
import LoginModal, { DEMO_ACCOUNTS } from './components/LoginModal';
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
  const [currentUser, setCurrentUser] = useState(DEMO_ACCOUNTS[0]); // Ana García por defecto
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [currentTab, setCurrentTab] = useState('auctions');
  const { lista: notifs, push: pushNotif } = useNotif();

  const refreshWallet = async () => {
    if (!currentUser || currentUser.role === 'Admin') return;
    try {
      const data = await getWallet(currentUser.id);
      setWallet(data);
    } catch (err) {
      console.log('Usando datos locales de billetera.');
    }
  };

  useEffect(() => {
    refreshWallet();

    // Evitar pantalla negra al cambiar entre Admin y Compradores
    if (currentUser?.role === 'Admin' && currentTab === 'wallet') {
      setCurrentTab('admin');
    } else if (currentUser?.role !== 'Admin' && currentTab === 'admin') {
      setCurrentTab('auctions');
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setLoginModalOpen(false);
    pushNotif('exito', 'Sesión Iniciada', `Bienvenido/a ${user.name}`);

    if (user.role === 'Admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('auctions');
    }
  };

  const handleLogout = () => {
    setCurrentUser(DEMO_ACCOUNTS[0]);
    setWallet(null);
    setCurrentTab('auctions');
    pushNotif('info', 'Sesión Restablecida', 'Modo visitante activo.');
  };

  const activeUserId = currentUser?.id || DEMO_ACCOUNTS[0].id;
  const isAdmin = currentUser?.role === 'Admin';

  // Garantizar que SIEMPRE se muestre una vista válida y nunca pantalla negra
  const renderActiveView = () => {
    if (currentTab === 'admin' && isAdmin) {
      return (
        <AdminPanel 
          onAuctionCreated={() => {
            pushNotif('exito', 'Catálogo Actualizado', 'Subasta publicada en el sistema.');
          }}
          pushNotif={pushNotif}
        />
      );
    }

    if (currentTab === 'wallet' && !isAdmin) {
      return (
        <WalletView 
          wallet={wallet} 
          activeUserId={activeUserId} 
          onWalletUpdated={refreshWallet} 
          pushNotif={pushNotif}
        />
      );
    }

    if (currentTab === 'audit') {
      return <AuditView />;
    }

    // Por defecto SIEMPRE renderiza la lista de subastas
    return (
      <AuctionList 
        activeUserId={activeUserId} 
        onBidSuccess={refreshWallet} 
        pushNotif={pushNotif}
      />
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#09050a', color: '#f0e8dc' }}>
      {/* Sistema de Notificaciones Flotante */}
      <Notificaciones lista={notifs} />

      {/* Modal de Inicio de Sesión */}
      <LoginModal 
        open={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Barra de Navegación con Login/Logout */}
      <Navbar 
        currentUser={currentUser} 
        wallet={wallet} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Contenido Principal */}
      <Container maxWidth="lg">
        {renderActiveView()}
      </Container>
    </Box>
  );
}

export default App;
