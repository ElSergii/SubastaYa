import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid, MenuItem, Select, FormControl, InputLabel, Alert } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { createAuction } from '../services/api';

const CATEGORIES = [
  { id: 'c1111111-1111-1111-1111-111111111111', name: 'Tecnología' },
  { id: 'c2222222-2222-2222-2222-222222222222', name: 'Coleccionables' },
  { id: 'c3333333-3333-3333-3333-333333333333', name: 'Indumentaria' },
  { id: 'c4444444-4444-4444-4444-444444444444', name: 'Vehículos' },
];

export default function AdminPanel({ onAuctionCreated, pushNotif }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    categoryId: CATEGORIES[0].id,
    startingPrice: 15000,
    minimumIncrement: 1000,
    durationMinutes: 60
  });

  const [cargando, setCargando] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setCargando(true);

    try {
      const now = new Date();
      const end = new Date(now.getTime() + Number(formData.durationMinutes) * 60000);

      const dto = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        categoryId: formData.categoryId,
        startingPrice: Number(formData.startingPrice),
        minimumIncrement: Number(formData.minimumIncrement),
        sellerId: '11111111-1111-1111-1111-111111111111', // ID Vendedor Admin
        startDate: now.toISOString(),
        endDate: end.toISOString()
      };

      await createAuction(dto);
      const msg = `¡Subasta "${formData.title}" creada e iniciada correctamente!`;
      setSuccessMsg(msg);
      if (pushNotif) pushNotif('exito', 'Subasta Creada', msg);

      // Limpiar formulario
      setFormData({
        title: '',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
        categoryId: CATEGORIES[0].id,
        startingPrice: 15000,
        minimumIncrement: 1000,
        durationMinutes: 60
      });

      if (onAuctionCreated) onAuctionCreated();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Error al crear la subasta.';
      setErrorMsg(msg);
      if (pushNotif) pushNotif('error', 'Error de Publicación', msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <AdminPanelSettingsIcon sx={{ color: '#c9a84c', fontSize: 32 }} />
        <Typography className="serif" variant="h4" sx={{ fontWeight: 800, color: '#f0e8dc' }}>
          Panel de Administración & Publicación
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#7a6458', mb: 4 }}>
        Espacio exclusivo para Administradores / Vendedores. Publique nuevos lotes en subasta en tiempo real.
      </Typography>

      <Grid container spacing={4}>
        {/* FORMULARIO DE CREACION */}
        <Grid item xs={12} md={7}>
          <Card className="glass-card">
            <CardContent sx={{ p: 3 }}>
              <Typography className="serif" variant="h6" sx={{ color: '#f0e8dc', mb: 3, fontWeight: 700 }}>
                Crear y Publicar Nueva Subasta
              </Typography>

              {successMsg && <Alert severity="success" sx={{ mb: 2, backgroundColor: '#052e16', color: '#86efac' }}>{successMsg}</Alert>}
              {errorMsg && <Alert severity="error" sx={{ mb: 2, backgroundColor: '#450a0a', color: '#fca5a5' }}>{errorMsg}</Alert>}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Título del Artículo"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  size="small"
                  sx={{
                    backgroundColor: '#09050a',
                    input: { color: '#f0e8dc' },
                    label: { color: '#7a6458' },
                    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(201,168,76,0.2)' } }
                  }}
                />

                <TextField
                  label="Descripción Detallada"
                  name="description"
                  multiline
                  rows={3}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  size="small"
                  sx={{
                    backgroundColor: '#09050a',
                    textarea: { color: '#f0e8dc' },
                    label: { color: '#7a6458' },
                    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(201,168,76,0.2)' } }
                  }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: '#7a6458' }}>Categoría</InputLabel>
                      <Select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        sx={{
                          backgroundColor: '#09050a',
                          color: '#f0e8dc',
                          '& .MuiSelect-icon': { color: '#c9a84c' },
                          '& fieldset': { borderColor: 'rgba(201,168,76,0.2)' }
                        }}
                      >
                        {CATEGORIES.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Duración (Minutos)"
                      name="durationMinutes"
                      type="number"
                      required
                      value={formData.durationMinutes}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                      sx={{
                        backgroundColor: '#09050a',
                        input: { color: '#c9a84c', fontFamily: 'JetBrains Mono' },
                        label: { color: '#7a6458' },
                        '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(201,168,76,0.2)' } }
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Precio Inicial ($)"
                      name="startingPrice"
                      type="number"
                      required
                      value={formData.startingPrice}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                      sx={{
                        backgroundColor: '#09050a',
                        input: { color: '#4ade80', fontFamily: 'JetBrains Mono', fontWeight: 700 },
                        label: { color: '#7a6458' },
                        '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(201,168,76,0.2)' } }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Incremento Mínimo ($)"
                      name="minimumIncrement"
                      type="number"
                      required
                      value={formData.minimumIncrement}
                      onChange={handleChange}
                      size="small"
                      fullWidth
                      sx={{
                        backgroundColor: '#09050a',
                        input: { color: '#c9a84c', fontFamily: 'JetBrains Mono' },
                        label: { color: '#7a6458' },
                        '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(201,168,76,0.2)' } }
                      }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  label="URL Imagen de Producto"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  size="small"
                  sx={{
                    backgroundColor: '#09050a',
                    input: { color: '#f0e8dc' },
                    label: { color: '#7a6458' },
                    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(201,168,76,0.2)' } }
                  }}
                />

                <Button
                  type="submit"
                  disabled={cargando}
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon sx={{ color: '#09050a' }} />}
                  sx={{
                    backgroundColor: '#c9a84c',
                    color: '#09050a',
                    fontWeight: 800,
                    textTransform: 'none',
                    py: 1.2,
                    borderRadius: 1.5,
                    '&:hover': { backgroundColor: '#e0be6a' }
                  }}
                >
                  {cargando ? 'Publicando...' : 'Publicar Subasta'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* METRICAS DEL SISTEMA ADMIN */}
        <Grid item xs={12} md={5}>
          <Card className="glass-card" sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography className="serif" variant="h6" sx={{ color: '#c9a84c', mb: 2, fontWeight: 700 }}>
                Estadísticas de Administración
              </Typography>
              <Typography variant="body2" sx={{ color: '#7a6458', mb: 3 }}>
                El rol de Administrador supervisa la creación de catálogos y el correcto cierre atómico de subastas.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 2, backgroundColor: '#09050a', borderRadius: 2, border: '1px solid rgba(201,168,76,0.1)' }}>
                  <Typography variant="caption" sx={{ color: '#7a6458' }}>ESTADO DE WORKER BACKGROUND</Typography>
                  <Typography variant="body1" sx={{ color: '#4ade80', fontWeight: 700 }}>
                    ● En Ejecución (Chequeo cada 10s)
                  </Typography>
                </Box>

                <Box sx={{ p: 2, backgroundColor: '#09050a', borderRadius: 2, border: '1px solid rgba(201,168,76,0.1)' }}>
                  <Typography variant="caption" sx={{ color: '#7a6458' }}>REGLA ANTI-SNIPING</Typography>
                  <Typography variant="body1" sx={{ color: '#c9a84c', fontWeight: 700 }}>
                    +2 min extensión automática
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
