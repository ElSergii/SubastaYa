import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, Button, TextField, Alert } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { depositWallet } from '../services/api';

export default function WalletView({ wallet, activeUserId, onWalletUpdated, pushNotif }) {
  const [depositAmount, setDepositAmount] = useState(5000);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setCargando(true);

    try {
      await depositWallet(activeUserId, Number(depositAmount));
      const msg = `¡Se depositaron $${Number(depositAmount).toLocaleString('es-AR')} exitosamente!`;
      setSuccessMsg(msg);
      if (pushNotif) pushNotif('exito', 'Fondos Recargados', msg);
      if (onWalletUpdated) onWalletUpdated();
    } catch (err) {
      const msg = 'Error al acreditar saldo a la billetera.';
      setErrorMsg(msg);
      if (pushNotif) pushNotif('error', 'Error de Depósito', msg);
    } finally {
      setCargando(false);
    }
  };

  if (!wallet) {
    return <Typography sx={{ color: '#7a6458', py: 4 }}>Cargando datos de billetera digital...</Typography>;
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography className="serif" variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#f0e8dc' }}>
        Mi Billetera Digital & Garantía Escrow
      </Typography>
      <Typography variant="body2" sx={{ color: '#7a6458', mb: 4 }}>
        Administración de fondos líquidos y reservas automáticas de garantía por cada oferta en curso.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Saldo Disponible */}
        <Grid item xs={12} sm={4}>
          <Card className="glass-card" sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon sx={{ color: '#4ade80', fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: '#7a6458', textTransform: 'uppercase', tracking: 1 }}>Saldo Disponible</Typography>
              </Box>
              <Typography className="serif" variant="h3" sx={{ color: '#4ade80', fontWeight: 800 }}>
                ${wallet.availableBalance.toLocaleString('es-AR')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Saldo Retenido / Escrow */}
        <Grid item xs={12} sm={4}>
          <Card className="glass-card" sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LockIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: '#7a6458', textTransform: 'uppercase', tracking: 1 }}>Garantía Retenida (Escrow)</Typography>
              </Box>
              <Typography className="serif" variant="h3" sx={{ color: '#f59e0b', fontWeight: 800 }}>
                ${wallet.heldBalance.toLocaleString('es-AR')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Saldo Total */}
        <Grid item xs={12} sm={4}>
          <Card className="glass-card" sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalanceWalletIcon sx={{ color: '#c9a84c', fontSize: 20 }} />
                <Typography variant="caption" sx={{ color: '#7a6458', textTransform: 'uppercase', tracking: 1 }}>Saldo Total</Typography>
              </Box>
              <Typography className="serif" variant="h3" sx={{ color: '#c9a84c', fontWeight: 800 }}>
                ${wallet.balance.toLocaleString('es-AR')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recarga de Fondos */}
      <Card className="glass-card" sx={{ maxWidth: 520 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography className="serif" variant="h6" sx={{ color: '#f0e8dc', mb: 1, fontWeight: 700 }}>
            Acreditar Saldo Simulado
          </Typography>
          <Typography variant="caption" sx={{ color: '#7a6458', display: 'block', mb: 3 }}>
            Simulación de acreditación bancaria inmediata para realizar ofertas.
          </Typography>

          {successMsg && <Alert severity="success" sx={{ mb: 2, backgroundColor: '#052e16', color: '#86efac' }}>{successMsg}</Alert>}
          {errorMsg && <Alert severity="error" sx={{ mb: 2, backgroundColor: '#450a0a', color: '#fca5a5' }}>{errorMsg}</Alert>}

          <Box component="form" onSubmit={handleDeposit} sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type="number"
              size="small"
              label="Monto ($)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              inputProps={{ min: 500, step: 500 }}
              sx={{
                backgroundColor: '#09050a',
                input: { color: '#c9a84c', fontFamily: 'JetBrains Mono', fontWeight: 700 },
                label: { color: '#7a6458' },
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
              startIcon={<AddCircleIcon sx={{ color: '#09050a' }} />}
              sx={{ 
                backgroundColor: '#c9a84c', 
                color: '#09050a', 
                fontWeight: 800, 
                textTransform: 'none',
                borderRadius: 1.5,
                '&:hover': { backgroundColor: '#e0be6a' } 
              }}
            >
              Depositar
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
