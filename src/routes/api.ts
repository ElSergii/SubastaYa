import { Router, Request, Response } from 'express';
import { SeatService, ConcurrencyConflictError } from '../services/seatService';
import { AuditService } from '../services/auditService';
import { runSeed } from '../db/seed';

export const apiRouter = Router();

function extractUserId(req: Request, fallback: string = 'USER_DEFAULT'): string {
  const headerVal = req.headers['x-user-id'];
  if (Array.isArray(headerVal)) return headerVal[0];
  if (typeof headerVal === 'string' && headerVal.trim().length > 0) return headerVal;
  if (req.body && typeof req.body.userId === 'string' && req.body.userId.trim().length > 0) return req.body.userId;
  return fallback;
}

/**
 * GET /api/v1/events
 * Listado paginado del catalogo de eventos
 */
apiRouter.get('/events', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const result = SeatService.getEventsList(page, limit);
    return res.status(200).json({
      success: true,
      data: result.events,
      pagination: {
        page,
        limit,
        total: result.total
      }
    });
  } catch (err: any) {
    console.error(`[CODE-ERROR] - Error en GET /api/v1/events: ${err.message}`);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al consultar el catalogo de eventos'
    });
  }
});

/**
 * POST /api/v1/events
 * ADMIN: Crea un nuevo evento con sectores y asientos numerados
 */
apiRouter.post('/events', (req: Request, res: Response) => {
  try {
    const { name, description, date, location, sectors } = req.body;
    const adminUserId = extractUserId(req, 'ADMIN_ROOT');

    if (!name || !date || !location || !sectors || !Array.isArray(sectors) || sectors.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Parametros insuficientes. Debe proporcionar name, date, location y al menos 1 sector.'
      });
    }

    const result = SeatService.createEventByAdmin(
      { name, description: description || '', date, location, sectors },
      adminUserId
    );

    return res.status(201).json({
      success: true,
      message: `Evento '${name}' creado exitosamente con ${result.totalCreatedSeats} asientos numerados.`,
      eventId: result.eventId,
      totalSeats: result.totalCreatedSeats
    });
  } catch (err: any) {
    console.error(`[CODE-ERROR] - Error en POST /api/v1/events: ${err.message}`);
    return res.status(400).json({
      success: false,
      error: err.message || 'Error al crear el evento administrativo'
    });
  }
});

/**
 * GET /api/v1/events/:eventId/seats
 * Retorna el estado actual de todas las butacas para renderizar el plano de asientos
 */
apiRouter.get('/events/:eventId/seats', (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const userId = extractUserId(req, 'GUEST_USER');

    const seats = SeatService.getSeatsByEvent(eventId, userId);
    return res.status(200).json({
      success: true,
      eventId,
      seats
    });
  } catch (err: any) {
    console.error(`[CODE-ERROR] - Error en GET /api/v1/events/:eventId/seats: ${err.message}`);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener el mapa de asientos'
    });
  }
});

/**
 * POST /api/v1/events/:eventId/seats/:seatId/reserve
 * Intento de reserva con control de concurrencia (Optimistic Locking)
 */
apiRouter.post('/events/:eventId/seats/:seatId/reserve', (req: Request, res: Response) => {
  try {
    const seatId = req.params.seatId as string;
    const userId = extractUserId(req, 'USER_DEFAULT');

    const result = SeatService.reserveSeat(seatId, userId);
    return res.status(201).json({
      success: true,
      message: 'Butaca reservada temporalmente por 5 minutos.',
      reservationId: result.reservationId,
      expiresAt: result.expiresAt
    });
  } catch (err: any) {
    if (err instanceof ConcurrencyConflictError) {
      return res.status(409).json({
        success: false,
        error: err.message,
        code: 'CONCURRENCY_CONFLICT'
      });
    }
    console.error(`[CODE-ERROR] - Error en POST /api/v1/events/:eventId/seats/:seatId/reserve: ${err.message}`);
    return res.status(400).json({
      success: false,
      error: err.message || 'Error al procesar la reserva'
    });
  }
});

/**
 * POST /api/v1/payments
 * Simulación de pago y confirmacion de compra transaccional ACID
 */
apiRouter.post('/payments', (req: Request, res: Response) => {
  try {
    const { reservationId } = req.body;

    if (!reservationId) {
      return res.status(400).json({
        success: false,
        error: 'El parametro reservationId es obligatorio.'
      });
    }

    const effectiveUserId = extractUserId(req, 'USER_DEFAULT');

    const result = SeatService.processPayment(reservationId, effectiveUserId);
    return res.status(200).json({
      success: true,
      message: 'Pago procesado con exito. Entradas vendidas y confirmadas.',
      transactionId: result.transactionId
    });
  } catch (err: any) {
    console.error(`[CODE-ERROR] - Error en POST /api/v1/payments: ${err.message}`);
    return res.status(400).json({
      success: false,
      error: err.message || 'Fallo al procesar el pago'
    });
  }
});

/**
 * GET /api/v1/admin/stats
 * ADMIN: Obtiene estadísticas globales de ventas y asientos
 */
apiRouter.get('/admin/stats', (req: Request, res: Response) => {
  try {
    const stats = SeatService.getAdminStats();
    return res.status(200).json({
      success: true,
      stats
    });
  } catch (err: any) {
    console.error(`[CODE-ERROR] - Error en GET /api/v1/admin/stats: ${err.message}`);
    return res.status(500).json({
      success: false,
      error: 'Error al consultar estadisticas administrativas'
    });
  }
});

/**
 * POST /api/v1/admin/reset-database
 * ADMIN: Reinicia la base de datos con el seed por defecto
 */
apiRouter.post('/admin/reset-database', (req: Request, res: Response) => {
  try {
    runSeed();
    return res.status(200).json({
      success: true,
      message: 'Base de datos reiniciada con éxito.'
    });
  } catch (err: any) {
    console.error(`[CODE-ERROR] - Error en POST /api/v1/admin/reset-database: ${err.message}`);
    return res.status(500).json({
      success: false,
      error: 'Error al reiniciar la base de datos'
    });
  }
});

/**
 * GET /api/v1/audit-logs
 * Obtiene el registro inmutable de auditoria
 */
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const logs = AuditService.getLogs(limit);
    return res.status(200).json({
      success: true,
      logs
    });
  } catch (err: any) {
    console.error(`[CODE-ERROR] - Error en GET /api/v1/audit-logs: ${err.message}`);
    return res.status(500).json({
      success: false,
      error: 'Error al consultar la auditoria'
    });
  }
});
