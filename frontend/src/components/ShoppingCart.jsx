import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Button, Divider, Alert } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import TimerIcon from '@mui/icons-material/Timer';

export const ShoppingCart = ({
  reservation,
  onPaymentConfirm,
  onTimerExpired,
  onToggleUser
}) => {
  const [timeLeftStr, setTimeLeftStr] = useState('05:00');

  useEffect(() => {
    if (!reservation) return;

    const expiresTime = new Date(reservation.expiresAt).getTime();

    const interval = setInterval(() => {
      const diff = expiresTime - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeftStr('00:00');
        onTimerExpired();
      } else {
        const min = Math.floor(diff / 60000);
        const sec = Math.floor((diff % 60000) / 1000);
        setTimeLeftStr(`${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation, onTimerExpired]);

  return (
    <Paper sx={{ p: 3, height: '100%' }} data-sys-render="auto">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ShoppingCartIcon color="primary" />
        <Typography variant="h6">Carrito de Compras</Typography>
      </Box>

      {!reservation ? (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="h2" sx={{ opacity: 0.3, mb: 1 }}>💺</Typography>
          <Typography variant="body2">
            Seleccione una butaca disponible en el mapa para iniciar el bloqueo temporal de 5 minutos.
          </Typography>
        </Box>
      ) : (
        <Box data-sys-render="auto">
          <Alert severity="warning" icon={<TimerIcon />} sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>TIEMPO RESTANTE DE BLOQUEO</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b', my: 0.5 }}>{timeLeftStr}</Typography>
            <Typography variant="caption" color="text.secondary">Si el tiempo expira, la butaca se liberará automáticamente en el servidor SQL Server.</Typography>
          </Alert>

          <Box sx={{ background: 'rgba(0, 0, 0, 0.2)', p: 2, borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Asiento:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>#{reservation.seatNumber}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Sector:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{reservation.sectorName}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Precio Total:</Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>${reservation.price.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">ID Reserva:</Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{reservation.reservationId.substring(0, 16)}...</Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="success"
            size="large"
            startIcon={<PaymentIcon />}
            onClick={onPaymentConfirm}
            sx={{ py: 1.2, fontWeight: 700 }}
          >
            Confirmar y Pagar Entrada
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(30, 41, 59, 0.4)', border: '1px dashed rgba(255, 255, 255, 0.15)' }} data-sys-render="auto">
        <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>🧪 Simulación de Concurrencia</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Pruebe dos sesiones de usuario simultáneas para comprobar el bloqueo atómico.
        </Typography>
        <Button fullWidth size="small" variant="outlined" color="inherit" onClick={onToggleUser}>
          Cambiar Sesión de Usuario
        </Button>
      </Box>
    </Paper>
  );
};
