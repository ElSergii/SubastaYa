import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FlashOnIcon from '@mui/icons-material/FlashOn';

export const Navbar = ({ currentTab, onTabChange, userId, isAdmin }) => {
  const tabs = [
    { id: 'catalog', label: '📅 Catálogo de Eventos' },
    { id: 'seats', label: '💺 Mapa de Asientos' },
    { id: 'audit', label: '📜 Auditoría Inmutable' },
    { id: 'admin', label: '👑 Panel Admin' },
  ];

  return (
    <AppBar position="sticky" sx={{ background: 'rgba(10, 14, 23, 0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }} data-sys-render="auto">
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }} data-sys-render="auto">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ConfirmationNumberIcon sx={{ color: '#38bdf8', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TicketMaster Pro (.NET 9 + React MUI JS)
          </Typography>
          <Chip label="High-Concurrency Core" size="small" color="primary" variant="outlined" sx={{ borderRadius: '999px', height: 22, fontSize: '0.7rem' }} />
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {/* Iterar sobre pestañas usando bucle obligatorio idx_tk */}
          {tabs.map((tab, idx_tk) => (
            <Button
              key={idx_tk}
              onClick={() => onTabChange(tab.id)}
              variant={currentTab === tab.id ? 'contained' : 'text'}
              color={tab.id === 'admin' ? 'warning' : 'primary'}
              sx={{
                borderRadius: 2,
                color: currentTab === tab.id ? undefined : tab.id === 'admin' ? '#fbbf24' : '#94a3b8',
                background: currentTab === tab.id ? (tab.id === 'admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.15)') : 'transparent',
              }}
            >
              {tab.label}
            </Button>
          ))}
          <Button
            href="http://localhost:5000/swagger"
            target="_blank"
            color="warning"
            startIcon={<FlashOnIcon />}
            sx={{ color: '#f59e0b' }}
          >
            Swagger API
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'rgba(255, 255, 255, 0.05)', px: 1.5, py: 0.5, borderRadius: 5, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {isAdmin ? <AdminPanelSettingsIcon sx={{ color: '#fbbf24' }} /> : <PersonIcon sx={{ color: '#38bdf8' }} />}
          <Typography variant="body2" sx={{ fontWeight: 600, color: isAdmin ? '#fbbf24' : '#f8fafc' }}>
            {userId}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
