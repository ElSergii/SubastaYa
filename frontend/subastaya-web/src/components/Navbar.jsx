import React from 'react';
import { AppBar, Toolbar, Typography, Select, MenuItem, Box, Button, Chip } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export const USERS = [
  { id: 2, name: 'Comprador 1 (Ana García)', role: 'Comprador' },
  { id: 3, name: 'Comprador 2 (María López)', role: 'Comprador' },
  { id: 4, name: 'Comprador 3 (Carlos Sin Fondos)', role: 'Comprador' },
  { id: 1, name: '⚙️ Admin / Vendedor', role: 'Admin' }
];

export default function Navbar({ activeUser, setActiveUser, wallet, currentTab, setCurrentTab }) {
  const isAdmin = activeUser === 1;

  return (
    <AppBar position="sticky" className="glass-header" sx={{ elevation: 0, borderBottom: '1px solid rgba(201, 168, 76, 0.15)', background: 'rgba(9,5,10,0.95)' }}>
      <Toolbar sx={{ justifyContent: 'space-between', maxW: '1200px', width: '100%', mx: 'auto', px: { xs: 2, md: 4 } }}>
        
        {/* LOGO & TITULO ELEGANTE */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => setCurrentTab('auctions')}>
          <Box sx={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.1)' }}>
            <Typography sx={{ color: '#c9a84c', fontSize: '14px', fontWeight: 'bold' }}>✦</Typography>
          </Box>
          <Typography className="serif" variant="h6" sx={{ fontWeight: 800, color: '#c9a84c', letterSpacing: 0.5, fontSize: '1.25rem' }}>
            SubastaYa
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, ml: 2, pl: 2, borderLeft: '1px solid #1c0f15' }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34d399', boxShadow: '0 0 8px #34d399' }} />
            <Typography variant="caption" sx={{ color: '#7a6458', fontSize: '0.75rem' }}>
              Rol: {isAdmin ? 'ADMINISTRADOR' : 'COMPRADOR'}
            </Typography>
          </Box>
        </Box>

        {/* BOTONES DE NAVEGACION */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={() => setCurrentTab('auctions')}
            startIcon={<GavelIcon sx={{ color: currentTab === 'auctions' ? '#c9a84c' : '#7a6458' }} />}
            sx={{
              color: currentTab === 'auctions' ? '#c9a84c' : '#7a6458',
              borderBottom: currentTab === 'auctions' ? '2px solid #c9a84c' : 'none',
              borderRadius: 0,
              px: 2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { color: '#e0be6a', background: 'rgba(201,168,76,0.05)' }
            }}
          >
            Subastas
          </Button>

          {!isAdmin && (
            <Button 
              onClick={() => setCurrentTab('wallet')}
              startIcon={<AccountBalanceWalletIcon sx={{ color: currentTab === 'wallet' ? '#c9a84c' : '#7a6458' }} />}
              sx={{
                color: currentTab === 'wallet' ? '#c9a84c' : '#7a6458',
                borderBottom: currentTab === 'wallet' ? '2px solid #c9a84c' : 'none',
                borderRadius: 0,
                px: 2,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { color: '#e0be6a', background: 'rgba(201,168,76,0.05)' }
              }}
            >
              Billetera
            </Button>
          )}

          {isAdmin && (
            <Button 
              onClick={() => setCurrentTab('admin')}
              startIcon={<AdminPanelSettingsIcon sx={{ color: currentTab === 'admin' ? '#c9a84c' : '#7a6458' }} />}
              sx={{
                color: currentTab === 'admin' ? '#c9a84c' : '#7a6458',
                borderBottom: currentTab === 'admin' ? '2px solid #c9a84c' : 'none',
                borderRadius: 0,
                px: 2,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { color: '#e0be6a', background: 'rgba(201,168,76,0.05)' }
              }}
            >
              Crear Subasta (Admin)
            </Button>
          )}

          <Button 
            onClick={() => setCurrentTab('audit')}
            startIcon={<HistoryIcon sx={{ color: currentTab === 'audit' ? '#c9a84c' : '#7a6458' }} />}
            sx={{
              color: currentTab === 'audit' ? '#c9a84c' : '#7a6458',
              borderBottom: currentTab === 'audit' ? '2px solid #c9a84c' : 'none',
              borderRadius: 0,
              px: 2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { color: '#e0be6a', background: 'rgba(201,168,76,0.05)' }
            }}
          >
            Auditoría
          </Button>
        </Box>

        {/* SALDO RAPIDO Y CAMBIO DE USUARIO */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!isAdmin && wallet && (
            <Chip 
              icon={<AccountBalanceWalletIcon style={{ color: '#4ade80', fontSize: 16 }} />} 
              label={`Disp: $${wallet.availableBalance.toLocaleString('es-AR')}`}
              sx={{ 
                backgroundColor: '#130b10', 
                color: '#4ade80', 
                fontWeight: 700, 
                border: '1px solid rgba(74, 222, 128, 0.3)',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
          )}

          {isAdmin && (
            <Chip 
              icon={<AdminPanelSettingsIcon style={{ color: '#c9a84c', fontSize: 16 }} />} 
              label="MODO ADMIN"
              sx={{ 
                backgroundColor: '#130b10', 
                color: '#c9a84c', 
                fontWeight: 700, 
                border: '1px solid rgba(201, 168, 76, 0.4)'
              }}
            />
          )}

          <Select
            value={activeUser}
            onChange={(e) => {
              const val = Number(e.target.value);
              setActiveUser(val);
              if (val === 1) setCurrentTab('admin');
              else if (currentTab === 'admin') setCurrentTab('auctions');
            }}
            size="small"
            sx={{
              backgroundColor: '#130b10',
              color: '#f0e8dc',
              fontSize: '0.85rem',
              border: '1px solid rgba(201,168,76,0.25)',
              '& .MuiSelect-icon': { color: '#c9a84c' },
              borderRadius: 2
            }}
          >
            {USERS.map((user) => (
              <MenuItem key={user.id} value={user.id} sx={{ fontSize: '0.85rem' }}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
