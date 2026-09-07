import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, TextField, Box, Chip, Alert } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import GavelIcon from '@mui/icons-material/Gavel';
import { placeBid } from '../services/api';

export default function AuctionCard({ auction, activeUserId, onBidSuccess, pushNotif }) {
  const [bidAmount, setBidAmount] = useState(auction.currentPrice + 1000);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Formateador de tiempo restante en vivo
  useEffect(() => {
    const updateTimer = () => {
      const end = new Date(auction.endTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));

      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

      // Regla Anti-Sniping: Resaltar si quedan menos de 60s
      setIsCritical(diff <= 60 && diff > 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime]);

  // Sincronizar monto sugerido al actualizar precio
  useEffect(() => {
    setBidAmount(auction.currentPrice + (auction.minimumIncrement || 1000));
  }, [auction.currentPrice, auction.minimumIncrement]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setCargando(true);

    try {
      await placeBid(auction.id, activeUserId, Number(bidAmount));
      setSuccessMessage('¡Puja registrada exitosamente!');
      if (pushNotif) pushNotif('exito', 'Puja Exitosa', `Ofreciste $${bidAmount} en ${auction.title}`);
      if (onBidSuccess) onBidSuccess();
    } catch (err) {
      if (err.response?.status === 409) {
        const msg = '409 Conflict: Otro comprador envió una puja al mismo instante.';
        setErrorMessage(msg);
        if (pushNotif) pushNotif('error', 'Conflicto 409', msg);
      } else {
        const msg = err.response?.data?.message || err.response?.data || 'Error al procesar la puja.';
        setErrorMessage(msg);
        if (pushNotif) pushNotif('error', 'Error en Puja', msg);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card 
      className={`glass-card ${isCritical ? 'critical-timer' : ''}`}
      sx={{ color: '#f0e8dc', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Imagen con Gradiente */}
      <Box sx={{ relative: 'relative', height: 180, overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="180"
          image={auction.imageUrl || 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80'}
          alt={auction.title}
          sx={{ filter: 'brightness(0.7) saturate(0.95)', transition: 'transform 0.5s ease', '&:hover': { transform: 'scale(1.05)' } }}
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'linear-gradient(to top, #130b10 0%, rgba(19,11,16,0.4) 50%, transparent 100%)' 
          }} 
        />

        {/* Badges superiores */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
          <span className="badge-gold">
            {auction.categoryName || 'Subasta'}
          </span>
          <Chip 
            label="⚡ En Vivo" 
            size="small" 
            sx={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.4)', fontSize: '0.7rem' }} 
          />
        </Box>

        {/* Reloj Temporizador */}
        <Box sx={{ position: 'absolute', bottom: 12, right: 12 }}>
          <Chip 
            icon={<TimerIcon style={{ color: isCritical ? '#ef4444' : '#c9a84c', fontSize: 16 }} />} 
            label={timeLeft} 
            sx={{ 
              backgroundColor: isCritical ? '#450a0a' : '#09050a',
              color: isCritical ? '#fca5a5' : '#c9a84c',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              border: `1px solid ${isCritical ? '#ef4444' : 'rgba(201,168,76,0.3)'}`
            }}
          />
        </Box>
      </Box>

      {/* Contenido de la Subasta */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        <Typography className="serif" variant="h6" sx={{ fontWeight: 700, color: '#f0e8dc', mb: 0.5, lineHeight: 1.2 }}>
          {auction.title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#7a6458', mb: 2, fontSize: '0.82rem', flexGrow: 1 }}>
          {auction.description}
        </Typography>

        {/* Bloque de Precios */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1.5, borderRadius: 2, backgroundColor: 'rgba(9,5,10,0.8)', border: '1px solid rgba(201,168,76,0.1)' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#7a6458', fontSize: '0.7rem', textTransform: 'uppercase', tracking: 1 }}>Precio Base</Typography>
            <Typography variant="body2" sx={{ color: '#f0e8dc', fontFamily: 'JetBrains Mono' }}>${auction.startingPrice.toLocaleString('es-AR')}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: '#7a6458', fontSize: '0.7rem', textTransform: 'uppercase', tracking: 1 }}>Puja Mayor</Typography>
            <Typography className="serif" variant="h6" sx={{ color: '#c9a84c', fontWeight: 800, lineHeight: 1 }}>
              ${auction.currentPrice.toLocaleString('es-AR')}
            </Typography>
          </Box>
        </Box>

        {auction.winningUserId && (
          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>
            👑 Líder actual: Usuario #{auction.winningUserId}
          </Typography>
        )}

        {/* Alertas */}
        {errorMessage && <Alert severity="error" sx={{ mb: 1, py: 0, fontSize: '0.75rem', backgroundColor: '#450a0a', color: '#fca5a5' }}>{errorMessage}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 1, py: 0, fontSize: '0.75rem', backgroundColor: '#052e16', color: '#86efac' }}>{successMessage}</Alert>}

        {/* Formulario de Oferta */}
        <Box component="form" onSubmit={handleBidSubmit} sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <TextField
            type="number"
            size="small"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            inputProps={{ min: auction.currentPrice + 1 }}
            sx={{
              backgroundColor: '#09050a',
              input: { color: '#c9a84c', fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: '0.85rem' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(201,168,76,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(201,168,76,0.5)' }
              },
              borderRadius: 1.5,
              flexGrow: 1
            }}
          />
          <Button 
            type="submit" 
            disabled={cargando}
            variant="contained" 
            startIcon={<GavelIcon sx={{ color: '#09050a' }} />}
            sx={{ 
              backgroundColor: '#c9a84c', 
              color: '#09050a', 
              fontWeight: 800, 
              textTransform: 'none',
              borderRadius: 1.5,
              '&:hover': { backgroundColor: '#e0be6a' } 
            }}
          >
            {cargando ? 'Pujando...' : 'Pujar'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
