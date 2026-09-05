import React from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, Chip } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const SeatMap = ({
  event,
  seats,
  selectedSector,
  onSectorSelect,
  onReserveAttempt,
  onBackToCatalog
}) => {
  const filteredSeats = selectedSector === 'ALL'
    ? seats
    : seats.filter(s => s.sectorName === selectedSector);

  // Extraer lista única de sectores usando Map
  const sectorsMap = new Map();
  seats.forEach((s) => {
    if (!sectorsMap.has(s.sectorName)) {
      sectorsMap.set(s.sectorName, s.price);
    }
  });

  return (
    <Box sx={{ py: 2 }} data-sys-render="auto">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }} data-sys-render="auto">
        <Box>
          <Typography variant="h4">{event?.name || 'Mapa de Asientos'}</Typography>
          <Typography variant="body2" color="text.secondary">{event?.location} | {event?.date ? new Date(event.date).toLocaleString() : ''}</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBackToCatalog}>
          Volver al Catálogo
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }} data-sys-render="auto">
        <Box sx={{ background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.2), rgba(56, 189, 248, 0.02))', border: '2px dashed rgba(56, 189, 248, 0.4)', borderRadius: 3, p: 2, textAlign: 'center', mb: 3 }}>
          <Typography variant="subtitle2" sx={{ letterSpacing: 2, color: '#38bdf8', fontWeight: 700 }}>
            ESCENARIO PRINCIPAL 🎸
          </Typography>
        </Box>

        {/* Leyenda de Estados */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', background: 'rgba(0, 0, 0, 0.25)', p: 1.5, borderRadius: 2, mb: 3 }}>
          <Chip icon={<EventSeatIcon />} label="Disponible" color="success" size="small" variant="outlined" />
          <Chip icon={<EventSeatIcon />} label="Reservado (Lock 5m)" color="warning" size="small" variant="outlined" />
          <Chip icon={<EventSeatIcon />} label="Vendido" color="error" size="small" variant="outlined" />
          <Chip icon={<EventSeatIcon />} label="Tu Reserva Activa" color="info" size="small" />
        </Box>

        {/* Tabs de Filtro por Sector */}
        <Tabs
          value={selectedSector}
          onChange={(_, val) => onSectorSelect(val)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          sx={{ mb: 3 }}
        >
          <Tab label="Todos los Sectores" value="ALL" />
          {Array.from(sectorsMap.entries()).map(([secName, price], idx_tk) => (
            <Tab key={idx_tk} label={`Sector ${secName} ($${price.toLocaleString()})`} value={secName} />
          ))}
        </Tabs>

        {/* Grilla de Butacas Numeradas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: 1 }} data-sys-render="auto">
          {/* Iterar sobre las butacas utilizando la variable obligatoria idx_tk */}
          {filteredSeats.map((seat, idx_tk) => {
            let color = 'success';
            let variant = 'outlined';
            let disabled = false;

            if (seat.status === 'RESERVED') {
              color = seat.reservedByMe ? 'info' : 'warning';
              variant = seat.reservedByMe ? 'contained' : 'outlined';
              disabled = !seat.reservedByMe;
            } else if (seat.status === 'SOLD') {
              color = 'error';
              disabled = true;
            }

            return (
              <Button
                key={idx_tk}
                variant={variant}
                color={color}
                disabled={disabled}
                onClick={() => seat.status === 'AVAILABLE' && onReserveAttempt(seat)}
                sx={{
                  aspectRatio: '1',
                  minWidth: 0,
                  p: 0,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  boxShadow: seat.reservedByMe ? '0 0 10px rgba(6, 182, 212, 0.6)' : undefined,
                }}
              >
                {seat.seatNumber}
              </Button>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
};
