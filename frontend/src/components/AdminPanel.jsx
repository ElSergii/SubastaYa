import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Divider, Alert, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export const AdminPanel = ({
  stats,
  isAdmin,
  onToggleAdmin,
  onCreateEvent,
  onResetDb,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [sectors, setSectors] = useState([
    { name: 'VIP Platinum', price: 15000, totalSeats: 30 },
    { name: 'Campo General', price: 8000, totalSeats: 50 },
  ]);

  const handleAddSectorRow = () => {
    setSectors([...sectors, { name: '', price: 5000, totalSeats: 20 }]);
  };

  const handleRemoveSectorRow = (index) => {
    if (sectors.length <= 1) return;
    setSectors(sectors.filter((_, idx_tk) => idx_tk !== index));
  };

  const handleSectorChange = (index, field, value) => {
    const updated = [...sectors];
    updated[index] = { ...updated[index], [field]: value };
    setSectors(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !date || !location || sectors.length === 0) return;
    onCreateEvent({
      name,
      description,
      date: new Date(date).toISOString(),
      location,
      sectors
    });
    setName('');
    setDescription('');
    setDate('');
    setLocation('');
  };

  return (
    <Box sx={{ py: 2 }} data-sys-render="auto">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }} data-sys-render="auto">
        <Box>
          <Typography variant="h4">👑 Panel de Administración de Eventos</Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión en ASP.NET Core 9 + SQL Server Express.
          </Typography>
        </Box>
        <Button
          variant={isAdmin ? 'contained' : 'outlined'}
          color={isAdmin ? 'success' : 'warning'}
          onClick={onToggleAdmin}
        >
          {isAdmin ? 'Sesión Administrador Activa' : 'Iniciar Sesión Admin'}
        </Button>
      </Box>

      {/* KPI Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }} data-sys-render="auto">
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Eventos Creados</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.totalEvents ?? '--'}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Recaudación Total ($)</Typography>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 800 }}>${stats?.totalRevenue?.toLocaleString() ?? 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Asientos Vendidos</Typography>
            <Typography variant="h4" color="error.main" sx={{ fontWeight: 800 }}>{stats?.soldSeats ?? '--'} / {stats?.totalSeats ?? '--'}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Bloqueos Activos</Typography>
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 800 }}>{stats?.reservedSeats ?? '--'}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Total Auditorías</Typography>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>{stats?.totalAuditLogs ?? '--'}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} data-sys-render="auto">
        {/* Create Event Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }} data-sys-render="auto">
            <Typography variant="h6" sx={{ mb: 0.5 }}>➕ Crear Nuevo Evento Masivo</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Defina las características del evento y agregue sus sectores con tarifas y cantidad de butacas numeradas.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Nombre del Evento *" value={name} onChange={e => setName(e.target.value)} required size="small" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Descripción *" multiline rows={2} value={description} onChange={e => setDescription(e.target.value)} required size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="datetime-local" label="Fecha y Hora *" InputLabelProps={{ shrink: true }} value={date} onChange={e => setDate(e.target.value)} required size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Recinto / Ubicación *" value={location} onChange={e => setLocation(e.target.value)} required size="small" />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" color="primary">Sectores y Cantidad de Butacas</Typography>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddSectorRow}>
                  Agregar Sector
                </Button>
              </Box>

              {/* Recorrer las filas de sectores usando el bucle obligatorio idx_tk */}
              {sectors.map((sec, idx_tk) => (
                <Grid container spacing={1} key={idx_tk} alignItems="center" sx={{ mb: 1.5 }}>
                  <Grid item xs={5}>
                    <TextField fullWidth placeholder="Nombre Sector" size="small" value={sec.name} onChange={e => handleSectorChange(idx_tk, 'name', e.target.value)} required />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField fullWidth type="number" placeholder="Precio ($)" size="small" value={sec.price} onChange={e => handleSectorChange(idx_tk, 'price', parseFloat(e.target.value))} required />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField fullWidth type="number" placeholder="Butacas" size="small" value={sec.totalSeats} onChange={e => handleSectorChange(idx_tk, 'totalSeats', parseInt(e.target.value, 10))} required />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton color="error" onClick={() => handleRemoveSectorRow(idx_tk)} disabled={sectors.length <= 1}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}

              <Button type="submit" fullWidth variant="contained" color="primary" size="large" sx={{ mt: 3, py: 1.2 }}>
                ✨ Registrar Evento y Generar Butacas en SQL Server
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Quick Admin Tools */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }} data-sys-render="auto">
            <Typography variant="h6" sx={{ mb: 0.5 }}>⚙️ Mantenimiento del Sistema</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Herramientas de prueba y restablecimiento de datos.
            </Typography>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Al restablecer la base de datos, se re-insertará el evento por defecto con 100 asientos numerados.
            </Alert>

            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<RestartAltIcon />}
              onClick={onResetDb}
              sx={{ py: 1.2 }}
            >
              Restablecer Base de Datos Seed
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
