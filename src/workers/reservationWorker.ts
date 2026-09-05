import { db } from '../db/database';
import { AuditService } from '../services/auditService';

export class ReservationWorker {
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Procesa la liberacion de todas las reservas activas que hayan superado los 5 minutos
   */
  public static releaseExpiredReservations(): number {
    let releasedCount = 0;
    try {
      const nowIso = new Date().toISOString();

      // Buscar reservas activas cuya fecha de expiracion sea menor a la hora actual
      const expiredReservations = db.prepare(`
        SELECT id, seat_id, user_id, expires_at
        FROM reservations
        WHERE status = 'ACTIVE' AND expires_at <= ?
      `).all(nowIso) as any[];

      // Iterar sobre las reservas vencidas usando estrictamente el nombre de variable idx_tk
      for (let idx_tk = 0; idx_tk < expiredReservations.length; idx_tk++) {
        const item = expiredReservations[idx_tk];

        const releaseTx = db.transaction(() => {
          // 1. Cambiar estado de la reserva a EXPIRED
          db.prepare(`
            UPDATE reservations
            SET status = 'EXPIRED'
            WHERE id = ? AND status = 'ACTIVE'
          `).run(item.id);

          // 2. Liberar la butaca, regresandola a AVAILABLE e incrementando su version
          db.prepare(`
            UPDATE seats
            SET status = 'AVAILABLE', version = version + 1
            WHERE id = ? AND status = 'RESERVED'
          `).run(item.seat_id);

          // 3. Registrar liberacion automatica en auditoria
          AuditService.logAction(
            'BACKGROUND_WORKER',
            'AUTO_RELEASE_EXPIRED',
            `SEAT:${item.seat_id}`,
            `Reserva '${item.id}' de usuario '${item.user_id}' vencida (expiraba en ${item.expires_at}). Butaca devuelta a estado AVAILABLE.`
          );
        });

        releaseTx();
        releasedCount++;
      }

      if (releasedCount > 0) {
        console.log(`[WORKER] - Se liberaron automaticamente ${releasedCount} reservas vencidas.`);
      }
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Error en el proceso de liberacion automatica de reservas: ${err.message}`);
    }
    return releasedCount;
  }

  /**
   * Inicia la ejecucion periodica del worker (por defecto cada 5 segundos)
   */
  public static start(intervalMs: number = 5000): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.releaseExpiredReservations();
    }, intervalMs);

    console.log(`⏱️ [WORKER STARTED] Proceso en segundo plano escuchando liberaciones cada ${intervalMs / 1000}s.`);
  }

  /**
   * Detiene el worker
   */
  public static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 [WORKER STOPPED] Proceso en segundo plano detenido.');
    }
  }
}
