import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import * as signalR from '@microsoft/signalr';
import AuctionCard from './AuctionCard';
import { getAuctions } from '../services/api';

export default function AuctionList({ activeUserId, onBidSuccess, pushNotif }) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

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

    // Conexión SignalR en vivo
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/auction')
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        console.log('SignalR AuctionHub conectado');

        // Evento: Nueva puja recibida
        connection.on('ReceiveBid', (auctionId, winningUserId, currentPrice) => {
          setAuctions((prev) =>
            prev.map((auc) =>
              auc.id === auctionId
                ? { ...auc, winningUserId, currentPrice }
                : auc
            )
          );
          if (pushNotif) pushNotif('info', 'Puja en Vivo ⚡', `Subasta #${auctionId} subió a $${currentPrice}`);
        });

        // Evento: Anti-Sniping extendido
        connection.on('AuctionExtended', (auctionId, newEndTime) => {
          setAuctions((prev) =>
            prev.map((auc) =>
              auc.id === auctionId
                ? { ...auc, endTime: newEndTime }
                : auc
            )
          );
          if (pushNotif) pushNotif('aviso', 'Regla Anti-Sniping ⏳', `¡Subasta #${auctionId} extendida 2 minutos!`);
        });
      })
      .catch((err) => console.error('SignalR Error:', err));

    return () => {
      connection.stop();
    };
  }, []);

  const totalPujas = auctions.reduce((acc, curr) => acc + (curr.bidCount || 0), 0);

  return (
    <Box sx={{ py: 4 }}>
      {/* SECCION HERO INSPIRADA EN EL DISEÑO */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="caption" sx={{ letterSpacing: 3, color: '#9b2335', textTransform: 'uppercase', fontWeight: 600, display: 'block', mb: 1 }}>
          PLATAFORMA DE SUBASTAS EN TIEMPO REAL
        </Typography>
        <Typography className="serif" variant="h2" sx={{ fontWeight: 900, color: '#f0e8dc', lineHeight: 1.05, fontSize: { xs: '2.5rem', md: '4rem' } }}>
          Subastas <em style={{ fontStyle: 'italic', color: '#c9a84c' }}>en vivo.</em>
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, color: '#7a6458', maxWidth: 600, fontSize: '0.95rem', lineHeight: 1.6 }}>
          Participá en las subastas con reserva de fondos en Billetera Escrow, protección anti-sniping y control de concurrencia optimista en tiempo real.
        </Typography>

        {/* METRICAS RAPIDAS */}
        <Box sx={{ display: 'flex', gap: 5, mt: 4 }}>
          <Box>
            <Typography className="serif" variant="h4" sx={{ fontWeight: 800, color: '#c9a84c' }}>
              {auctions.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#7a6458' }}>Subastas Activas</Typography>
          </Box>
          <Box>
            <Typography className="serif" variant="h4" sx={{ fontWeight: 800, color: '#c9a84c' }}>
              {totalPujas}
            </Typography>
            <Typography variant="caption" sx={{ color: '#7a6458' }}>Pujas Registradas</Typography>
          </Box>
          <Box>
            <Typography className="serif" variant="h4" sx={{ fontWeight: 800, color: '#c9a84c' }}>
              100%
            </Typography>
            <Typography variant="caption" sx={{ color: '#7a6458' }}>Transacciones ACID</Typography>
          </Box>
        </Box>
      </Box>

      {/* LINEA DIVISORA DORADA */}
      <Box className="gold-line" sx={{ mb: 5 }} />

      {/* TITULO DE SECCION */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography className="serif" variant="h5" sx={{ fontWeight: 700, color: '#f0e8dc' }}>
          Lotes en Subasta
        </Typography>
        <Typography variant="caption" sx={{ color: '#7a6458' }}>
          {auctions.length} catálogo(s) disponible(s)
        </Typography>
      </Box>

      {/* GRILLA DE SUBASTAS */}
      {loading ? (
        <Typography sx={{ color: '#7a6458' }}>Cargando catálogo en vivo...</Typography>
      ) : (
        <Grid container spacing={3}>
          {auctions.map((auc) => (
            <Grid item xs={12} sm={6} md={4} key={auc.id}>
              <AuctionCard 
                auction={auc} 
                activeUserId={activeUserId} 
                pushNotif={pushNotif}
                onBidSuccess={() => {
                  fetchAuctionsList();
                  if (onBidSuccess) onBidSuccess();
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
