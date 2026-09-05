import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, CssBaseline, Box, Container, Snackbar, Alert } from '@mui/material';
import { theme } from './theme';
import { Navbar } from './components/Navbar';
import { EventCatalog } from './components/EventCatalog';
import { SeatMap } from './components/SeatMap';
import { ShoppingCart } from './components/ShoppingCart';
import { AuditLogViewer } from './components/AuditLogViewer';
import { AdminPanel } from './components/AdminPanel';

const API_BASE = 'http://localhost:5000/api/v1';

export const App = () => {
  const [currentTab, setCurrentTab] = useState('catalog');
  const [userId, setUserId] = useState(() => 'USER_' + Math.floor(Math.random() * 8999 + 1000));
  const [isAdmin, setIsAdmin] = useState(false);

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSector, setSelectedSector] = useState('ALL');

  const [activeReservation, setActiveReservation] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [adminStats, setAdminStats] = useState(null);

  // Snackbar Toast System
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const showToast = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // 1. Cargar catálogo de eventos
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/events`);
      const json = await res.json();
      if (json.success && json.data && json.data.events) {
        setEvents(json.data.events);
        if (!selectedEvent && json.data.events.length > 0) {
          setSelectedEvent(json.data.events[0]);
        }
      }
    } catch (err) {
      console.error(`[CODE-ERROR] - Fallo al cargar eventos en React JS: ${err.message}`);
    }
  }, [selectedEvent]);

  // 2. Cargar mapa de asientos
  const fetchSeats = useCallback(async (eventId, silent = false) => {
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/seats`, {
        headers: { 'x-user-id': userId }
      });
      const json = await res.json();
      if (json.success && json.seats) {
        setSeats(json.seats);
      }
    } catch (err) {
      console.error(`[CODE-ERROR] - Fallo al cargar asientos en React JS: ${err.message}`);
    }
  }, [userId]);

  // 3. Cargar logs de auditoría
  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/audit-logs?limit=50`);
      const json = await res.json();
      if (json.success && json.logs) {
        setAuditLogs(json.logs);
      }
    } catch (err) {
      console.error(`[CODE-ERROR] - Fallo al cargar auditoría en React JS: ${err.message}`);
    }
  }, []);

  // 4. Cargar estadísticas de administración
  const fetchAdminStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      const json = await res.json();
      if (json.success && json.stats) {
        setAdminStats(json.stats);
      }
    } catch (err) {
      console.error(`[CODE-ERROR] - Fallo al cargar estadísticas admin en React JS: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (selectedEvent) {
      fetchSeats(selectedEvent.id);
    }
  }, [selectedEvent, fetchSeats]);

  // Auto-refresh silencioso del mapa de asientos cada 8s
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTab === 'seats' && selectedEvent) {
        fetchSeats(selectedEvent.id, true);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [currentTab, selectedEvent, fetchSeats]);

  // Cambiar pestañas
  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    if (tab === 'audit') fetchAuditLogs();
    if (tab === 'admin') fetchAdminStats();
    if (tab === 'seats' && selectedEvent) fetchSeats(selectedEvent.id);
  };

  // Seleccionar evento del catálogo
  const handleSelectEvent = (evt) => {
    setSelectedEvent(evt);
    setCurrentTab('seats');
  };

  // Intentar Reserva con Optimistic Locking (HTTP 409 Conflict Handling)
  const handleReserveAttempt = async (seat) => {
    if (activeReservation) {
      showToast('Ya tienes una reserva activa en tu carrito. Completa el pago o espera a que expire.', 'warning');
      return;
    }

    try {
      showToast(`Intentando bloquear Asiento #${seat.seatNumber}...`, 'info');

      const res = await fetch(`${API_BASE}/events/${selectedEvent?.id}/seats/${seat.id}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ userId })
      });

      const json = await res.json();

      if (res.status === 409 || !json.success) {
        // CONFLICTO DE CONCURRENCIA
        showToast(json.error || 'Asiento ya no disponible. Ganado por otra petición concurrente.', 'error');
        if (selectedEvent) fetchSeats(selectedEvent.id, true);
        return;
      }

      // RESERVA EXITOSA (HTTP 201)
      showToast(`¡Reserva Exitosa! Asiento #${seat.seatNumber} bloqueado por 5 minutos.`, 'success');
      setActiveReservation({
        reservationId: json.reservationId,
        seatId: seat.id,
        seatNumber: seat.seatNumber,
        sectorName: seat.sectorName,
        price: seat.price,
        expiresAt: json.expiresAt
      });

      if (selectedEvent) fetchSeats(selectedEvent.id, true);
    } catch (err) {
      console.error(`[CODE-ERROR] - Fallo en petición de reserva React JS: ${err.message}`);
      showToast('Error de conexión al reservar.', 'error');
    }
  };

  // Confirmar Pago Transaccional ACID
  const handlePaymentConfirm = async () => {
    if (!activeReservation) return;

    try {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          reservationId: activeReservation.reservationId,
          userId
        })
      });

      const json = await res.json();

      if (!json.success) {
        showToast(json.error || 'Error al procesar el pago.', 'error');
        return;
      }

      showToast(`🎉 ¡Compra exitosa! Transacción ACID: ${json.transactionId}`, 'success');
      setActiveReservation(null);
      if (selectedEvent) fetchSeats(selectedEvent.id, true);
    } catch (err) {
      console.error(`[CODE-ERROR] - Fallo al procesar pago en React JS: ${err.message}`);
      showToast('Error al conectar con la pasarela de pago.', 'error');
    }
  };

  // Expiración del Temporizador
  const handleTimerExpired = () => {
    showToast('⚠️ Tu reserva de 5 minutos ha expirado. El asiento ha sido liberado automáticamente.', 'warning');
    setActiveReservation(null);
    if (selectedEvent) fetchSeats(selectedEvent.id, true);
  };

  // Cambiar sesión de usuario
  const handleToggleUser = () => {
    if (isAdmin) {
      setIsAdmin(false);
      const newId = 'USER_' + Math.floor(Math.random() * 8999 + 1000);
      setUserId(newId);
      showToast(`Cambiado a sesión de Cliente: ${newId}`, 'info');
    } else {
      setIsAdmin(true);
      setUserId('ADMIN_ROOT');
      showToast('🔓 Sesión cambiada a Administrador.', 'success');
    }
    setActiveReservation(null);
  };

  // Crear Evento por Admin
  const handleCreateEvent = async (eventData) => {
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(eventData)
      });

      const json = await res.json();
      if (json.success) {
        showToast(`🎉 ${json.message}`, 'success');
        fetchEvents();
        fetchAdminStats();
      } else {
        showToast(json.error || 'Fallo al crear evento.', 'error');
      }
    } catch (err) {
      console.error(`[CODE-ERROR] - Error al crear evento desde React Admin JS: ${err.message}`);
      showToast('Error al conectar con la API para crear evento.', 'error');
    }
  };

  // Restablecer Base de Datos Seed
  const handleResetDb = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/reset-database`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast('🔄 Base de datos SQL Server restablecida con éxito.', 'success');
        setActiveReservation(null);
        fetchEvents();
        fetchAdminStats();
      }
    } catch (err) {
      console.error(`[CODE-ERROR] - Error al reiniciar BD desde React JS: ${err.message}`);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', pb: 6 }} data-sys-render="auto">
        <Navbar
          currentTab={currentTab}
          onTabChange={handleTabChange}
          userId={userId}
          isAdmin={isAdmin}
        />

        <Container maxWidth="xl" sx={{ mt: 3 }} data-sys-render="auto">
          {currentTab === 'catalog' && (
            <EventCatalog events={events} onSelectEvent={handleSelectEvent} />
          )}

          {currentTab === 'seats' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' }, gap: 3 }} data-sys-render="auto">
              <SeatMap
                event={selectedEvent}
                seats={seats}
                selectedSector={selectedSector}
                onSectorSelect={setSelectedSector}
                onReserveAttempt={handleReserveAttempt}
                onBackToCatalog={() => setCurrentTab('catalog')}
              />
              <ShoppingCart
                reservation={activeReservation}
                onPaymentConfirm={handlePaymentConfirm}
                onTimerExpired={handleTimerExpired}
                onToggleUser={handleToggleUser}
              />
            </Box>
          )}

          {currentTab === 'audit' && (
            <AuditLogViewer logs={auditLogs} onRefresh={fetchAuditLogs} />
          )}

          {currentTab === 'admin' && (
            <AdminPanel
              stats={adminStats}
              isAdmin={isAdmin}
              onToggleAdmin={handleToggleUser}
              onCreateEvent={handleCreateEvent}
              onResetDb={handleResetDb}
            />
          )}
        </Container>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%', borderRadius: 2 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};
