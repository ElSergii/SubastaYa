import React from 'react';
import { AppBar, Toolbar, Typography, Select, MenuItem, Box, Chip, Button } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GavelIcon from '@mui/icons-material/Gavel';
import HistoryIcon from '@mui/icons-material/History';

export const USERS = [
  { id: 2, name: 'Comprador 1 (Juan)' },
  { id: 3, name: 'Comprador 2 (María)' },
  { id: 4, name: 'Comprador (Sin Fondos)' },
  { id: 1, name: 'Vendedor (Admin)' }
];

export default function Navbar({ activeUser, setActiveUser, wallet, currentTab, setCurrentTab }) {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Titulo del Sistema */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon sx={{ color: '#38bdf8', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
            SubastaYa
          </Typography>
        </Box>

        {/* NAVEGACION */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant={currentTab === 'auctions' ? 'contained' : 'text'}
            onClick={() => setCurrentTab('auctions')}
            startIcon={<GavelIcon />}
            sx={{ color: currentTab === 'auctions' ? '#fff' : '#94a3b8' }}
          >
            Subastas
          </Button>

          <Button 
            variant={currentTab === 'wallet' ? 'contained' : 'text'}
            onClick={() => setCurrentTab('wallet')}
            startIcon={<AccountBalanceWalletIcon />}
            sx={{ color: currentTab === 'wallet' ? '#fff' : '#94a3b8' }}
          >
            Billetera
          </Button>

          <Button 
            variant={currentTab === 'audit' ? 'contained' : 'text'}
            onClick={() => setCurrentTab('audit')}
            startIcon={<HistoryIcon />}
            sx={{ color: currentTab === 'audit' ? '#fff' : '#94a3b8' }}
          >
            Auditoría
          </Button>
        </Box>

        {/* SELECCION DE USUARIO Y BALANCE RAPIDO */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {wallet && (
            <Chip 
              icon={<AccountBalanceWalletIcon style={{ color: '#4ade80' }} />} 
              label={`Disponible: $${wallet.availableBalance}`}
              sx={{ backgroundColor: '#0f172a', color: '#4ade80', fontWeight: 'bold' }}
            />
          )}

          <Select
            value={activeUser}
            onChange={(e) => setActiveUser(Number(e.target.value))}
            size="small"
            sx={{
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              '& .MuiSelect-icon': { color: '#f8fafc' },
              borderRadius: 2
            }}
          >
            {USERS.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
