import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, TextField, Box, Chip, Alert } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import GavelIcon from '@mui/icons-material/Gavel';
import { placeBid } from '../services/api';

export default function AuctionCard({ auction, activeUserId, onBidSuccess }) {
  const [bidAmount, setBidAmount] = useState(auction.currentPrice + 10);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isCritical, setIsCritical] = useState(false);

  // Formatear contador de tiempo restante
  useEffect(() => {
    const updateTimer = () => {
      const end = new Date(auction.endTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));

      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

      // Regla Anti-Sniping: Resaltar si queda menos de 60 segundos
      setIsCritical(diff <= 60 && diff > 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime]);

  // Actualizar monto sugerido al cambiar el precio actual
  useEffect(() => {
    setBidAmount(auction.currentPrice + 10);
  }, [auction.currentPrice]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await placeBid(auction.id, activeUserId, Number(bidAmount));
      setSuccessMessage('¡Puja realizada con éxito!');
      if (onBidSuccess) onBidSuccess();
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorMessage('⚠️ Conflicto de Concurrencia (409): Otro comprador pujó al mismo tiempo.');
      } else {
        setErrorMessage(err.response?.data?.message || err.response?.data || 'Error al procesar la puja.');
      }
    }
  };

  return (
    <Card 
      className={`glass-card ${isCritical ? 'critical-timer' : ''}`}
      sx={{ color: '#f8fafc', position: 'relative', overflow: 'visible' }}
    >
      <CardContent>
        {/* Cabecera de la Tarjeta */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip label={auction.status || 'Activa'} color="primary" size="small" />
          <Chip 
            icon={<TimerIcon sx={{ color: isCritical ? '#ef4444' : '#38bdf8' }} />} 
            label={timeLeft} 
            sx={{ 
              backgroundColor: isCritical ? '#450a0a' : '#0f172a',
              color: isCritical ? '#fca5a5' : '#38bdf8',
              fontWeight: 'bold' 
            }}
          />
        </Box>

        {/* Titulo y Descripción */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
          {auction.title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
          {auction.description}
        </Typography>

        {/* Precios */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1.5, bg: '#0f172a', borderRadius: 2, backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Precio Base</Typography>
            <Typography variant="body1">${auction.startingPrice}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Puja Actual</Typography>
            <Typography variant="h6" sx={{ color: '#4ade80', fontWeight: 'bold' }}>
              ${auction.currentPrice}
            </Typography>
          </Box>
        </Box>

        {/* Ganador actual */}
        {auction.winningUserId && (
          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#cbd5e1' }}>
            Líder actual: Usuario #{auction.winningUserId}
          </Typography>
        )}

        {/* Mensajes de feedback */}
        {errorMessage && <Alert severity="error" sx={{ mb: 1, fontSize: '0.8rem' }}>{errorMessage}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 1, fontSize: '0.8rem' }}>{successMessage}</Alert>}

        {/* Formulario de Puja */}
        <Box component="form" onSubmit={handleBidSubmit} sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            type="number"
            size="small"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            inputProps={{ min: auction.currentPrice + 1, step: 5 }}
            sx={{
              backgroundColor: '#0f172a',
              input: { color: '#fff' },
              borderRadius: 1,
              flexGrow: 1
            }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={<GavelIcon />}
            sx={{ backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } }}
          >
            Pujar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
