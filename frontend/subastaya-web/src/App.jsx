import React, { useState, useEffect, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import AuctionList from './components/AuctionList';
import WalletView from './components/WalletView';
import AuditView from './components/AuditView';
import AdminPanel from './components/AdminPanel';
import LoginModal, { DEMO_ACCOUNTS } from './components/LoginModal';
import CreateAuctionModal from './components/CreateAuctionModal';
import { getWallet } from './services/api';
import './App.css';

// HOOK DE NOTIFICACIONES FLOTANTES CON BOOTSTRAP TOAST Y BOTÓN DE CIERRE
function useNotif() {
  const [lista, setLista] = useState([]);
  
  const dismiss = useCallback((id) => {
    setLista((p) => p.map((n) => (n.id === id ? { ...n, saliendo: true } : n)));
    setTimeout(() => setLista((p) => p.filter((n) => n.id !== id)), 280);
  }, []);

  const push = useCallback((tipo, titulo, mensaje) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    setLista((p) => [...p, { id, tipo, titulo, mensaje }]);
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  }, [dismiss]);

  return { lista, push, dismiss };
}

function Notificaciones({ lista, dismiss }) {
  const iconos = { exito: '✓', error: '✕', aviso: '⚠', info: 'ℹ' };

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        pointerEvents: 'none',
        width: 330,
      }}
    >
      {lista.map((n) => (
        <div
          key={n.id}
          className={`toast-in ${n.saliendo ? 'toast-out' : ''} p-3 rounded glass-card shadow-lg d-flex align-items-start justify-content-between gap-2`}
          style={{
            pointerEvents: 'auto',
            backgroundColor: 'rgba(19, 11, 16, 0.96)',
            borderColor: n.tipo === 'exito' ? '#22c55e' : n.tipo === 'error' ? '#ef4444' : '#c9a84c',
            color: '#f0e8dc',
          }}
        >
          <div className="d-flex align-items-start gap-3">
            <span className={`fw-bold fs-5 ${n.tipo === 'exito' ? 'text-success' : n.tipo === 'error' ? 'text-danger' : 'text-warning'}`}>
              {iconos[n.tipo]}
            </span>
            <div>
              <h6 className="fw-bold mb-1 small text-light">{n.titulo}</h6>
              <p className="text-secondary small mb-0" style={{ fontSize: '0.78rem' }}>{n.mensaje}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dismiss(n.id)}
            className="btn btn-link text-secondary p-0 border-0 ms-2 lh-1 text-decoration-none"
            style={{ fontSize: '1.2rem', cursor: 'pointer' }}
            title="Cerrar notificación"
            aria-label="Cerrar notificación"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(DEMO_ACCOUNTS[0]);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [currentTab, setCurrentTab] = useState('auctions');
  const { lista: notifs, push: pushNotif, dismiss: dismissNotif } = useNotif();

  const refreshWallet = async () => {
    if (!currentUser) return;
    try {
      const data = await getWallet(currentUser.id);
      setWallet(data);
    } catch {
      // Silenciar logs de fallback local
    }
  };

  useEffect(() => {
    refreshWallet();

    if (currentUser?.role !== 'Admin' && currentTab === 'admin') {
      setCurrentTab('auctions');
    }

    const interval = setInterval(refreshWallet, 2000);
    return () => clearInterval(interval);
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

    if (currentTab === 'wallet') {
      return (
        <WalletView 
          wallet={wallet} 
          activeUserId={activeUserId} 
          currentUser={currentUser}
          onWalletUpdated={refreshWallet} 
          pushNotif={pushNotif}
        />
      );
    }

    if (currentTab === 'audit') {
      return <AuditView currentUser={currentUser} activeUserId={activeUserId} />;
    }

    return (
      <AuctionList 
        activeUserId={activeUserId} 
        wallet={wallet}
        onBidSuccess={refreshWallet} 
        pushNotif={pushNotif}
      />
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09050a', color: '#f0e8dc' }}>
      {/* Sistema de Notificaciones Flotante */}
      <Notificaciones lista={notifs} dismiss={dismissNotif} />

      {/* Modal de Inicio de Sesión */}
      <LoginModal 
        open={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Modal de Publicar Subasta */}
      <CreateAuctionModal
        show={createModalOpen}
        onHide={() => setCreateModalOpen(false)}
        currentUser={currentUser}
        onAuctionCreated={() => {
          refreshWallet();
          pushNotif('exito', 'Catálogo Actualizado', 'La subasta fue publicada con éxito.');
        }}
        pushNotif={pushNotif}
      />

      {/* Barra de Navegación Bootstrap */}
      <Navbar 
        currentUser={currentUser} 
        wallet={wallet} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenCreateAuction={() => setCreateModalOpen(true)}
      />

      {/* Contenido Principal */}
      <Container className="pb-5">
        {renderActiveView()}
      </Container>
    </div>
  );
}

export default App;
