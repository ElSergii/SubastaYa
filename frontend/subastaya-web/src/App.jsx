import React, { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import Navbar from './components/Navbar';
import AuctionList from './components/AuctionList';
import WalletView from './components/WalletView';
import AuditView from './components/AuditView';
import { getWallet } from './services/api';
import './App.css';

function App() {
  const [activeUser, setActiveUser] = useState(2); // Comprador 1 por defecto
  const [wallet, setWallet] = useState(null);
  const [currentTab, setCurrentTab] = useState('auctions');

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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Barra de Navegación */}
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
          />
        )}

        {currentTab === 'wallet' && (
          <WalletView 
            wallet={wallet} 
            activeUserId={activeUser} 
            onWalletUpdated={refreshWallet} 
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
