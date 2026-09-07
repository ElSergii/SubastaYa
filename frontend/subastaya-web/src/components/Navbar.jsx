import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Chip, Avatar } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

export default function Navbar({ currentUser, wallet, currentTab, setCurrentTab, onOpenLogin, onLogout }) {
  const isAdmin = currentUser?.role === 'Admin';

  return (
    <AppBar position="sticky" className="glass-header" sx={{ elevation: 0, borderBottom: '1px solid rgba(201, 168, 76, 0.15)', background: 'rgba(9,5,10,0.95)' }}>
      <Toolbar sx={{ justifyContent: 'space-between', maxW: '1200px', width: '100%', mx: 'auto', px: { xs: 2, md: 4 } }}>
        
        {/* LOGO & TITULO */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => setCurrentTab('auctions')}>
          <Box sx={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.1)' }}>
            <Typography sx={{ color: '#c9a84c', fontSize: '15px', fontWeight: 'bold' }}>✦</Typography>
          </Box>
          <Typography className="serif" variant="h6" sx={{ fontWeight: 800, color: '#c9a84c', letterSpacing: 0.5, fontSize: '1.25rem' }}>
            SubastaYa
          </Typography>
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

        {/* ESTADO DE AUTENTICACION Y USUARIO */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {currentUser ? (
            <>
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
                  label="ADMIN"
                  sx={{ 
                    backgroundColor: '#130b10', 
                    color: '#c9a84c', 
                    fontWeight: 700, 
                    border: '1px solid rgba(201, 168, 76, 0.4)'
                  }}
                />
              )}

              {/* CHIP DE USUARIO ACTIVO */}
              <Box 
                onClick={onOpenLogin}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: 2, 
                  backgroundColor: '#130b10',
                  border: '1px solid rgba(201,168,76,0.2)',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#c9a84c' }
                }}
              >
                <Avatar sx={{ bgcolor: isAdmin ? '#9b2335' : '#c9a84c', color: '#09050a', width: 26, height: 26, fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {currentUser.avatar || currentUser.name.charAt(0)}
                </Avatar>
                <Typography variant="body2" sx={{ color: '#f0e8dc', fontWeight: 600, fontSize: '0.85rem' }}>
                  {currentUser.name}
                </Typography>
              </Box>

              <Button
                size="small"
                onClick={onLogout}
                startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
                sx={{ color: '#7a6458', textTransform: 'none', '&:hover': { color: '#ef4444' } }}
              >
                Salir
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={onOpenLogin}
              startIcon={<LoginIcon sx={{ color: '#09050a' }} />}
              sx={{
                backgroundColor: '#c9a84c',
                color: '#09050a',
                fontWeight: 800,
                textTransform: 'none',
                borderRadius: 1.5,
                '&:hover': { backgroundColor: '#e0be6a' }
              }}
            >
              Iniciar Sesión
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
