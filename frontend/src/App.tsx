import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, CssBaseline, Box, Container, Snackbar, Alert } from '@mui/material';
import { theme } from './theme';
import { Navbar } from './components/Navbar';
import { EventCatalog } from './components/EventCatalog';
import { SeatMap } from './components/SeatMap';
import { ShoppingCart } from './components/ShoppingCart';
import { AuditLogViewer } from './components/AuditLogViewer';
import { AdminPanel } from './components/AdminPanel';
import { EventCatalogItem, SeatStatus, ActiveReservation, AuditRecord, AdminStats } from './types';

const API_BASE = 'http://localhost:5000/api/v1';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('catalog');
  const [userId, setUserId] = useState<string>(() => 'USER_' + Math.floor(Math.random() * 8999 + 1000));
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [events, setEvents] = useState<EventCatalogItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventCatalogItem | null>(null);
  const [seats, setSeats] = useState<SeatStatus[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  const [activeReservation, setActiveReservation] = useState<ActiveReservation | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // Snackbar Toast System
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showToast = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
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
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo al cargar eventos en React: ${err.message}`);
    }
  }, [selectedEvent]);

  // 2. Cargar mapa de asientos
  const fetchSeats = useCallback(async (eventId: string, silent = false) => {
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/seats`, {
        headers: { 'x-user-id': userId }
      });
      const json = await res.json();
      if (json.success && json.seats) {
        setSeats(json.seats);
      }
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo al cargar asientos en React: ${err.message}`);
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
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo al cargar auditoría en React: ${err.message}`);
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
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo al cargar estadísticas admin en React: ${err.message}`);
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
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    if (tab === 'audit') fetchAuditLogs();
    if (tab === 'admin') fetchAdminStats();
    if (tab === 'seats' && selectedEvent) fetchSeats(selectedEvent.id);
  };

  // Seleccionar evento del catálogo
  const handleSelectEvent = (evt: EventCatalogItem) => {
    setSelectedEvent(evt);
    setCurrentTab('seats');
  };

  // Intentar Reserva con Optimistic Locking (HTTP 409 Conflict Handling)
  const handleReserveAttempt = async (seat: SeatStatus) => {
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
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo en peticion de reserva React: ${err.message}`);
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
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo al procesar pago en React: ${err.message}`);
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
  const handleCreateEvent = async (eventData: any) => {
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
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Error al crear evento desde React Admin: ${err.message}`);
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
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Error al reiniciar BD desde React: ${err.message}`);
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
