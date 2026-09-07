import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Alert, Snackbar } from '@mui/material';
import * as signalR from '@microsoft/signalr';
import AuctionCard from './AuctionCard';
import { getAuctions } from '../services/api';

export default function AuctionList({ activeUserId, onBidSuccess }) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  const fetchAuctionsList = async () => {
    try {
      const data = await getAuctions();
      setAuctions(data);
    } catch (err) {
      console.error('Error al cargar subastas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionsList();

    // Conexión en tiempo real por SignalR
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/auction')
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        console.log('Conectado a SignalR AuctionHub');

        // Escuchar nueva puja
        connection.on('ReceiveBid', (auctionId, winningUserId, currentPrice) => {
          setAuctions((prev) =>
            prev.map((auc) =>
              auc.id === auctionId
                ? { ...auc, winningUserId, currentPrice }
                : auc
            )
          );
          setNotification(`⚡ Nueva puja en vivo: Subasta #${auctionId} subió a $${currentPrice}`);
        });

        // Escuchar extensión Anti-Sniping
        connection.on('AuctionExtended', (auctionId, newEndTime) => {
          setAuctions((prev) =>
            prev.map((auc) =>
              auc.id === auctionId
                ? { ...auc, endTime: newEndTime }
                : auc
            )
          );
          setNotification(`⏳ Regla Anti-Sniping: ¡Subasta #${auctionId} extendida 2 minutos!`);
        });
      })
      .catch((err) => console.error('SignalR Error:', err));

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#f8fafc' }}>
        Subastas Activas en Tiempo Real
      </Typography>

      {loading ? (
        <Typography color="gray">Cargando subastas...</Typography>
      ) : (
        <Grid container spacing={3}>
          {auctions.map((auc) => (
            <Grid item xs={12} sm={6} md={4} key={auc.id}>
              <AuctionCard 
                auction={auc} 
                activeUserId={activeUserId} 
                onBidSuccess={() => {
                  fetchAuctionsList();
                  if (onBidSuccess) onBidSuccess();
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Notificación flotante de SignalR */}
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={4000}
        onClose={() => setNotification('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="info" variant="filled" sx={{ width: '100%' }}>
          {notification}
        </Alert>
      </Snackbar>
    </Box>
  );
}
