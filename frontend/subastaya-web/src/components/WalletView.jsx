import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, Button, TextField, Alert } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { depositWallet } from '../services/api';

export default function WalletView({ wallet, activeUserId, onWalletUpdated }) {
  const [depositAmount, setDepositAmount] = useState(100);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDeposit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await depositWallet(activeUserId, Number(depositAmount));
      setSuccessMsg(`¡Se han acreditado $${depositAmount} correctamente!`);
      if (onWalletUpdated) onWalletUpdated();
    } catch (err) {
      setErrorMsg('Error al abonar saldo a la billetera.');
    }
  };

  if (!wallet) {
    return <Typography color="gray">Cargando datos de billetera...</Typography>;
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#f8fafc' }}>
        Mi Billetera Digital & Escrow
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Saldo Disponible */}
        <Grid item xs={12} sm={4}>
          <Card className="glass-card" sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon sx={{ color: '#4ade80' }} />
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>Saldo Disponible</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#4ade80', fontWeight: 'bold' }}>
                ${wallet.availableBalance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Saldo Retenido / Escrow */}
        <Grid item xs={12} sm={4}>
          <Card className="glass-card" sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LockIcon sx={{ color: '#f59e0b' }} />
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>Retenido (Pujas Activas)</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                ${wallet.heldBalance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Saldo Total */}
        <Grid item xs={12} sm={4}>
          <Card className="glass-card" sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalanceWalletIcon sx={{ color: '#38bdf8' }} />
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>Saldo Total</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#38bdf8', fontWeight: 'bold' }}>
                ${wallet.balance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recarga de Saldo */}
      <Card className="glass-card" sx={{ maxWidth: 500 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#f8fafc', mb: 2 }}>
            Recargar Fondos Simulado
          </Typography>

          {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

          <Box component="form" onSubmit={handleDeposit} sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type="number"
              size="small"
              label="Monto a Cargar ($)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              inputProps={{ min: 10 }}
              sx={{
                backgroundColor: '#0f172a',
                input: { color: '#fff' },
                label: { color: '#94a3b8' },
                borderRadius: 1,
                flexGrow: 1
              }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddCircleIcon />}
              sx={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' } }}
            >
              Depositar
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
