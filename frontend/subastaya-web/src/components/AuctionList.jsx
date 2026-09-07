import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import AuctionCard from './AuctionCard';
import { getAuctions } from '../services/api';

const now = new Date();

export const DEFAULT_SAMPLE_AUCTIONS = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    title: 'MacBook Pro M3 Max 16 inch 36GB RAM',
    description: 'Laptop profesional Apple M3 Max en estado impecable con caja original y cargador 140W.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Tecnología',
    startingPrice: 30000,
    currentPrice: 45000,
    minimumIncrement: 2000,
    winningUserId: '22222222-2222-2222-2222-222222222222',
    endTime: new Date(now.getTime() + 25 * 60000).toISOString(),
    status: 'Active',
    bidCount: 4
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    title: 'Reloj Rolex Submariner Date 1998 Original',
    description: 'Edición de colección con certificado de autenticidad y service oficial reciente.',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Coleccionables',
    startingPrice: 100000,
    currentPrice: 125000,
    minimumIncrement: 5000,
    winningUserId: '33333333-3333-3333-3333-333333333333',
    endTime: new Date(now.getTime() + 45 * 1000).toISOString(), // Quedan 45s (Anti-Sniping Zona Crítica)
    status: 'Active',
    bidCount: 6
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    title: 'Guitarra Gibson Les Paul Standard 1959 Reissue',
    description: 'Instrumento de gama alta con estuche rígido Custom Shop e inspección certificada.',
    imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Coleccionables',
    startingPrice: 80000,
    currentPrice: 85000,
    minimumIncrement: 2500,
    winningUserId: null,
    endTime: new Date(now.getTime() + 90 * 60000).toISOString(),
    status: 'Active',
    bidCount: 2
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    title: 'Chaqueta de Cuero Vintage Schott NYC',
    description: 'Chaqueta clásica de cuero vacuno talle M en excelente estado de conservación.',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Indumentaria',
    startingPrice: 15000,
    currentPrice: 28000,
    minimumIncrement: 1000,
    winningUserId: '22222222-2222-2222-2222-222222222222',
    endTime: new Date(now.getTime() + 40 * 60000).toISOString(),
    status: 'Active',
    bidCount: 5
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    title: 'Scooter Eléctrico Xiaomi Pro 2',
    description: 'Scooter urbano 45km autonomía con freno de disco y pantalla digital integrada.',
    imageUrl: 'https://images.unsplash.com/photo-1597086884617-64b58e72efcb?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Vehículos',
    startingPrice: 50000,
    currentPrice: 52000,
    minimumIncrement: 2000,
    winningUserId: null,
    endTime: new Date(now.getTime() + 15 * 60000).toISOString(),
    status: 'Active',
    bidCount: 1
  },
  {
    id: 'a6666666-6666-6666-6666-666666666666',
    title: 'Porsche 911 Carrera RS 1973 Scale Model',
    description: 'Réplica de colección escala 1:18 en metal con detalles de interior artesanales.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    categoryName: 'Vehículos',
    startingPrice: 40000,
    currentPrice: 45000,
    minimumIncrement: 1500,
    winningUserId: '33333333-3333-3333-3333-333333333333',
    endTime: new Date(now.getTime() + 60 * 60000).toISOString(),
    status: 'Active',
    bidCount: 3
  }
];

export default function AuctionList({ activeUserId, onBidSuccess, pushNotif }) {
  const [auctions, setAuctions] = useState(DEFAULT_SAMPLE_AUCTIONS);

  const fetchAuctionsList = async () => {
    const data = await getAuctions();
    if (Array.isArray(data) && data.length > 0) {
      setAuctions(data);
    }
  };

  useEffect(() => {
    fetchAuctionsList();
  }, []);

  const totalPujas = auctions.reduce((acc, curr) => acc + (curr.bidCount || 0), 0);

  return (
    <Box sx={{ py: 4 }}>
      {/* SECCION HERO */}
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
    </Box>
  );
}
