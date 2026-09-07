import React, { useState } from 'react';
import { Dialog, DialogContent, Typography, Box, Button, TextField, Chip, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GavelIcon from '@mui/icons-material/Gavel';

export const DEMO_ACCOUNTS = [
  { 
    id: '22222222-2222-2222-2222-222222222222', 
    name: 'Ana García (Comprador 1)', 
    email: 'comprador1@test.com', 
    role: 'Comprador', 
    avatar: 'A' 
  },
  { 
    id: '33333333-3333-3333-3333-333333333333', 
    name: 'María López (Comprador 2)', 
    email: 'comprador2@test.com', 
    role: 'Comprador', 
    avatar: 'M' 
  },
  { 
    id: '44444444-4444-4444-4444-444444444444', 
    name: 'Carlos Sin Fondos', 
    email: 'sinfondos@test.com', 
    role: 'Comprador', 
    avatar: 'C' 
  },
  { 
    id: '11111111-1111-1111-1111-111111111111', 
    name: 'Admin SubastaYa (Vendedor)', 
    email: 'vendedor@test.com', 
    role: 'Admin', 
    avatar: '⚙️' 
  }
];

export default function LoginModal({ open, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('demo');

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!email) return;

    if (email.includes('admin') || email.includes('vendedor')) {
      const user = DEMO_ACCOUNTS.find(a => a.role === 'Admin');
      onLoginSuccess(user);
    } else {
      const user = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase()) || DEMO_ACCOUNTS[0];
      onLoginSuccess(user);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: '#130b10',
          border: '1px solid rgba(201, 168, 76, 0.3)',
          borderRadius: 16,
          boxShadow: '0 0 50px rgba(0,0,0,0.9), 0 0 30px rgba(201, 168, 76, 0.15)'
        }
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        {/* CABECERA CON ISOTIPO */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box 
            sx={{ 
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(201, 168, 76, 0.1)', 
              border: '1px solid #c9a84c', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 1.5 
            }}
          >
            <GavelIcon sx={{ color: '#c9a84c', fontSize: 26 }} />
          </Box>
          <Typography className="serif" variant="h5" sx={{ fontWeight: 800, color: '#f0e8dc' }}>
            Acceso a SubastaYa
          </Typography>
          <Typography variant="caption" sx={{ color: '#7a6458', mt: 0.5 }}>
            Selecciona tu cuenta o ingresa con credenciales
          </Typography>
        </Box>

        {/* SELECTOR DE MODO DE INGRESO */}
        <Box sx={{ display: 'flex', borderBottom: '1px solid rgba(201, 168, 76, 0.15)', mb: 3 }}>
          <Button
            fullWidth
            onClick={() => setActiveTab('demo')}
            sx={{
              color: activeTab === 'demo' ? '#c9a84c' : '#7a6458',
              borderBottom: activeTab === 'demo' ? '2px solid #c9a84c' : 'none',
              borderRadius: 0,
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              pb: 1
            }}
          >
            Cuentas Rápidas (Demo)
          </Button>
          <Button
            fullWidth
            onClick={() => setActiveTab('form')}
            sx={{
              color: activeTab === 'form' ? '#c9a84c' : '#7a6458',
              borderBottom: activeTab === 'form' ? '2px solid #c9a84c' : 'none',
              borderRadius: 0,
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              pb: 1
            }}
          >
            Ingreso con Email
          </Button>
        </Box>

        {activeTab === 'demo' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <Box
                key={acc.id}
                onClick={() => onLoginSuccess(acc)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: '#09050a',
                  border: '1px solid rgba(201, 168, 76, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#c9a84c',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(201, 168, 76, 0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: acc.role === 'Admin' ? '#9b2335' : '#1c0f15', color: '#c9a84c', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {acc.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#f0e8dc' }}>
                      {acc.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7a6458', display: 'block', fontSize: '0.7rem' }}>
                      {acc.email}
                    </Typography>
                  </Box>
                </Box>

                <Chip 
                  label={acc.role} 
                  size="small" 
                  sx={{ 
                    backgroundColor: acc.role === 'Admin' ? 'rgba(155, 35, 53, 0.3)' : 'rgba(201, 168, 76, 0.15)', 
                    color: acc.role === 'Admin' ? '#fca5a5' : '#c9a84c', 
                    fontWeight: 700,
                    fontSize: '0.65rem'
                  }} 
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box component="form" onSubmit={handleCustomLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Correo Electrónico"
              type="email"
              required
              fullWidth
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="comprador1@test.com"
              sx={{
                backgroundColor: '#09050a',
                input: { color: '#f0e8dc' },
                label: { color: '#7a6458' },
                '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(201,168,76,0.2)' } }
              }}
            />

            <TextField
              label="Contraseña"
              type="password"
              required
              fullWidth
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              sx={{
                backgroundColor: '#09050a',
                input: { color: '#f0e8dc' },
                label: { color: '#7a6458' },
                '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(201,168,76,0.2)' } }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              startIcon={<LockOutlinedIcon sx={{ color: '#09050a' }} />}
              sx={{
                backgroundColor: '#c9a84c',
                color: '#09050a',
                fontWeight: 800,
                textTransform: 'none',
                py: 1.2,
                borderRadius: 1.5,
                mt: 1,
                '&:hover': { backgroundColor: '#e0be6a' }
              }}
            >
              Iniciar Sesión
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
