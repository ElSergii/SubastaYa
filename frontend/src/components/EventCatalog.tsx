import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Chip } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { EventCatalogItem } from '../types';

interface EventCatalogProps {
  events: EventCatalogItem[];
  onSelectEvent: (event: EventCatalogItem) => void;
}

export const EventCatalog: React.FC<EventCatalogProps> = ({ events, onSelectEvent }) => {
  return (
    <Box sx={{ py: 2 }} data-sys-render="auto">
      <Box sx={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))', p: 4, borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)', mb: 4, textAlign: 'center' }} data-sys-render="auto">
        <Typography variant="h3" sx={{ mb: 1, background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Plataforma Masiva de Venta de Entradas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sistema resiliente .NET 9 Web API + EF Core + SQL Server contra ventas duplicadas con Optimistic Locking y transacciones ACID.
        </Typography>
      </Box>

      <Typography variant="h4" sx={{ mb: 1 }}>Eventos Disponibles</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Seleccione un evento para acceder al plano de butacas en tiempo real.
      </Typography>

      <Grid container spacing={3} data-sys-render="auto">
        {/* Recorrer catálogo de eventos usando bucle obligatorio idx_tk */}
        {events.map((evt, idx_tk) => (
          <Grid item xs={12} sm={6} md={4} key={idx_tk}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s ease', '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(56, 189, 248, 0.3)', boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)' } }} data-sys-render="auto">
              <CardContent>
                <Typography variant="h5" sx={{ mb: 1 }}>{evt.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#38bdf8', mb: 1 }}>
                  <EventIcon fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(evt.date).toLocaleString()}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{evt.description}</Typography>
                
                <Box sx={{ background: 'rgba(0, 0, 0, 0.2)', p: 1.5, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">{evt.location}</Typography>
                  </Box>
                  <Chip
                    icon={<ConfirmationNumberIcon fontSize="small" />}
                    label={`${evt.availableSeats} / ${evt.totalSeats}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button fullWidth variant="contained" color="primary" onClick={() => onSelectEvent(evt)}>
                  Ver Plano y Comprar
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
