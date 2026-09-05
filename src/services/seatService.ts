import { db } from '../db/database';
import { AuditService } from './auditService';
import crypto from 'crypto';

export interface EventCatalogItem {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  sectorsCount: number;
  totalSeats: number;
  availableSeats: number;
}

export interface SeatStatus {
  id: string;
  sectorId: string;
  sectorName: string;
  price: number;
  seatNumber: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  version: number;
  expiresAt?: string;
  reservedByMe?: boolean;
}

export interface CreateSectorInput {
  name: string;
  price: number;
  totalSeats: number;
}

export interface CreateEventInput {
  name: string;
  description: string;
  date: string;
  location: string;
  sectors: CreateSectorInput[];
}

export class ConcurrencyConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConcurrencyConflictError';
  }
}

export class SeatService {
  /**
   * Obtiene el listado paginado del catálogo de eventos
   */
  public static getEventsList(page: number = 1, limit: number = 10): { events: EventCatalogItem[]; total: number } {
    try {
      const offset = (page - 1) * limit;

      const totalRow = db.prepare(`SELECT COUNT(*) as count FROM events`).get() as { count: number };

      const events = db.prepare(`
        SELECT 
          e.id, 
          e.name, 
          e.description, 
          e.date, 
          e.location,
          (SELECT COUNT(*) FROM sectors s WHERE s.event_id = e.id) as sectorsCount,
          (SELECT COUNT(*) FROM seats st JOIN sectors s ON st.sector_id = s.id WHERE s.event_id = e.id) as totalSeats,
          (SELECT COUNT(*) FROM seats st JOIN sectors s ON st.sector_id = s.id WHERE s.event_id = e.id AND st.status = 'AVAILABLE') as availableSeats
        FROM events e
        ORDER BY e.created_at DESC
        LIMIT ? OFFSET ?
      `).all(limit, offset) as EventCatalogItem[];

      return {
        events,
        total: totalRow.count
      };
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo al obtener la lista de eventos: ${err.message}`);
      throw err;
    }
  }

  /**
   * Obtiene el estado actual de todas las butacas de un evento
   */
  public static getSeatsByEvent(eventId: string, currentUserId?: string): SeatStatus[] {
    try {
      const stmt = db.prepare(`
        SELECT 
          st.id,
          st.sector_id as sectorId,
          sec.name as sectorName,
          sec.price,
          st.seat_number as seatNumber,
          st.status,
          st.version,
          res.expires_at as expiresAt,
          res.user_id as reservedBy
        FROM seats st
        JOIN sectors sec ON st.sector_id = sec.id
        LEFT JOIN reservations res ON res.seat_id = st.id AND res.status = 'ACTIVE'
        WHERE sec.event_id = ?
        ORDER BY sec.name ASC, st.seat_number ASC
      `);

      const rawRows = stmt.all(eventId) as any[];

      // Mapear con bucle nombrado estrictamente idx_tk
      const seats: SeatStatus[] = [];
      for (let idx_tk = 0; idx_tk < rawRows.length; idx_tk++) {
        const row = rawRows[idx_tk];
        seats.push({
          id: row.id,
          sectorId: row.sectorId,
          sectorName: row.sectorName,
          price: row.price,
          seatNumber: row.seatNumber,
          status: row.status,
          version: row.version,
          expiresAt: row.expiresAt,
          reservedByMe: currentUserId ? row.reservedBy === currentUserId : false
        });
      }

      return seats;
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo al consultar los asientos del evento: ${err.message}`);
      throw err;
    }
  }

  /**
   * Reserva una butaca con control estricto de concurrencia (Optimistic Locking)
   */
  public static reserveSeat(seatId: string, userId: string): { reservationId: string; expiresAt: string } {
    try {
      const reservationTransaction = db.transaction(() => {
        // 1. Obtener la butaca actual para verificar version y estado
        const seat = db.prepare(`SELECT id, status, version FROM seats WHERE id = ?`).get(seatId) as any;

        if (!seat) {
          throw new Error(`La butaca especificada '${seatId}' no existe.`);
        }

        if (seat.status !== 'AVAILABLE') {
          throw new ConcurrencyConflictError(`Asiento ya no disponible. Estado actual: '${seat.status}'.`);
        }

        // 2. Intentar actualizar estado de la butaca usando Optimistic Locking (verificando la columna version exacto)
        const updateResult = db.prepare(`
          UPDATE seats 
          SET status = 'RESERVED', version = version + 1 
          WHERE id = ? AND status = 'AVAILABLE' AND version = ?
        `).run(seatId, seat.version);

        if (updateResult.changes === 0) {
          throw new ConcurrencyConflictError('Asiento ya no disponible. Ganado por otra peticion concurrente.');
        }

        // 3. Crear la reserva activa (5 minutos de expiracion)
        const reservationId = `res-${crypto.randomUUID()}`;
        const expiresAtDate = new Date(Date.now() + 5 * 60 * 1000);
        const expiresAtStr = expiresAtDate.toISOString();

        db.prepare(`
          INSERT INTO reservations (id, seat_id, user_id, status, expires_at)
          VALUES (?, ?, ?, 'ACTIVE', ?)
        `).run(reservationId, seatId, userId, expiresAtStr);

        // 4. Registrar auditoria de reserva exitosa
        AuditService.logAction(
          userId,
          'RESERVE_ATTEMPT_SUCCESS',
          `RESERVATION:${reservationId}`,
          `Reserva creada exitosamente para la butaca '${seatId}' con expiracion en ${expiresAtStr}`
        );

        return { reservationId, expiresAt: expiresAtStr };
      });

      return reservationTransaction();
    } catch (err: any) {
      if (err instanceof ConcurrencyConflictError) {
        // Registrar intento fallido en auditoria fuera de la transaccion revertida
        AuditService.logAction(
          userId,
          'RESERVE_ATTEMPT_CONFLICT',
          `SEAT:${seatId}`,
          `Intento de reserva fallido por conflicto de concurrencia: ${err.message}`
        );
        throw err;
      }
      console.error(`[CODE-ERROR] - Error durante el proceso de reserva: ${err.message}`);
      throw err;
    }
  }

  /**
   * Procesa el pago de una reserva en una transaccion ACID atomica
   */
  public static processPayment(reservationId: string, userId: string): { success: boolean; transactionId: string } {
    const paymentTransaction = db.transaction(() => {
      // 1. Obtener y validar la reserva
      const reservation = db.prepare(`
        SELECT r.id, r.seat_id, r.user_id, r.status, r.expires_at, s.version
        FROM reservations r
        JOIN seats s ON r.seat_id = s.id
        WHERE r.id = ?
      `).get(reservationId) as any;

      if (!reservation) {
        throw new Error('Reserva no encontrada.');
      }

      if (reservation.user_id !== userId) {
        throw new Error('La reserva pertenece a otro usuario.');
      }

      if (reservation.status !== 'ACTIVE') {
        throw new Error(`La reserva no se encuentra activa (estado actual: ${reservation.status}).`);
      }

      const now = new Date();
      const expiresAt = new Date(reservation.expires_at);

      if (now > expiresAt) {
        throw new Error('La reserva ha expirado y no puede ser pagada.');
      }

      // 2. Cambiar el estado del asiento a "SOLD" y actualizar la version
      const seatUpdate = db.prepare(`
        UPDATE seats
        SET status = 'SOLD', version = version + 1
        WHERE id = ? AND status = 'RESERVED'
      `).run(reservation.seat_id);

      if (seatUpdate.changes === 0) {
        throw new Error('Fallo al actualizar el estado de la butaca a Vendida.');
      }

      // 3. Marcar reserva como COMPLETED
      const resUpdate = db.prepare(`
        UPDATE reservations
        SET status = 'COMPLETED'
        WHERE id = ? AND status = 'ACTIVE'
      `).run(reservationId);

      if (resUpdate.changes === 0) {
        throw new Error('Fallo al completar la reserva.');
      }

      const transactionId = `tx-${crypto.randomUUID()}`;

      // 4. Asentar auditoria de pago exitoso
      AuditService.logAction(
        userId,
        'PAYMENT_SUCCESS',
        `TRANSACTION:${transactionId}`,
        `Pago simulado procesado exitosamente para la reserva '${reservationId}' en la butaca '${reservation.seat_id}'`
      );

      return { success: true, transactionId };
    });

    try {
      return paymentTransaction();
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo transaccional al procesar el pago: ${err.message}`);
      throw err;
    }
  }

  /**
   * ADMIN: Crea un nuevo evento con sus sectores y asientos numerados en una transaccion ACID
   */
  public static createEventByAdmin(input: CreateEventInput, adminUserId: string): { eventId: string; totalCreatedSeats: number } {
    const createTx = db.transaction(() => {
      const eventId = `evt-${crypto.randomUUID().substring(0, 8)}`;
      
      db.prepare(`
        INSERT INTO events (id, name, description, date, location)
        VALUES (?, ?, ?, ?, ?)
      `).run(eventId, input.name, input.description, input.date, input.location);

      let totalCreatedSeats = 0;

      const insertSector = db.prepare(`
        INSERT INTO sectors (id, event_id, name, price, total_seats)
        VALUES (?, ?, ?, ?, ?)
      `);

      const insertSeat = db.prepare(`
        INSERT INTO seats (id, sector_id, seat_number, status, version)
        VALUES (?, ?, ?, 'AVAILABLE', 1)
      `);

      // Recorrer los sectores enviados por el admin usando bucle idx_tk
      for (let idx_tk = 0; idx_tk < input.sectors.length; idx_tk++) {
        const sec = input.sectors[idx_tk];
        const sectorId = `sec-${crypto.randomUUID().substring(0, 8)}`;
        insertSector.run(sectorId, eventId, sec.name, sec.price, sec.totalSeats);

        // Generar asientos numerados para el sector usando bucle secundario idx_tk_seat
        for (let idx_tk_seat = 1; idx_tk_seat <= sec.totalSeats; idx_tk_seat++) {
          const seatId = `seat-${sectorId}-${idx_tk_seat}`;
          insertSeat.run(seatId, sectorId, idx_tk_seat);
          totalCreatedSeats++;
        }
      }

      // Registrar accion administrativa en Auditoria
      AuditService.logAction(
        adminUserId,
        'ADMIN_EVENT_CREATED',
        `EVENT:${eventId}`,
        `Evento '${input.name}' creado exitosamente con ${input.sectors.length} sectores y ${totalCreatedSeats} asientos.`
      );

      return { eventId, totalCreatedSeats };
    });

    try {
      return createTx();
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo al crear evento administrativo: ${err.message}`);
      throw err;
    }
  }

  /**
   * ADMIN: Obtiene metricas globales del sistema
   */
  public static getAdminStats(): any {
    try {
      const totalEvents = (db.prepare(`SELECT COUNT(*) as c FROM events`).get() as any).c;
      const totalSeats = (db.prepare(`SELECT COUNT(*) as c FROM seats`).get() as any).c;
      const availableSeats = (db.prepare(`SELECT COUNT(*) as c FROM seats WHERE status = 'AVAILABLE'`).get() as any).c;
      const reservedSeats = (db.prepare(`SELECT COUNT(*) as c FROM seats WHERE status = 'RESERVED'`).get() as any).c;
      const soldSeats = (db.prepare(`SELECT COUNT(*) as c FROM seats WHERE status = 'SOLD'`).get() as any).c;

      // Calcular ingresos totales por ventas recaudadas
      const revenueRow = db.prepare(`
        SELECT COALESCE(SUM(sec.price), 0) as totalRevenue
        FROM seats st
        JOIN sectors sec ON st.sector_id = sec.id
        WHERE st.status = 'SOLD'
      `).get() as any;

      const totalAuditLogs = (db.prepare(`SELECT COUNT(*) as c FROM audit_logs`).get() as any).c;

      return {
        totalEvents,
        totalSeats,
        availableSeats,
        reservedSeats,
        soldSeats,
        totalRevenue: revenueRow.totalRevenue,
        totalAuditLogs
      };
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo al consultar estadísticas de administración: ${err.message}`);
      throw err;
    }
  }
}
