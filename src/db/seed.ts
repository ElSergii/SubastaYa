import { db, initDb } from './database';

export function runSeed(): void {
  try {
    initDb();

    // Limpiar tablas existentes para re-seed limpio
    db.exec(`DELETE FROM audit_logs;`);
    db.exec(`DELETE FROM reservations;`);
    db.exec(`DELETE FROM seats;`);
    db.exec(`DELETE FROM sectors;`);
    db.exec(`DELETE FROM events;`);

    const eventId = 'evt-rock-2026';
    const insertEvent = db.prepare(`
      INSERT INTO events (id, name, description, date, location)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertEvent.run(
      eventId,
      'Concierto Masivo de Rock 2026',
      'El evento masivo de rock mas esperado del año con artistas internacionales.',
      '2026-11-20T21:00:00Z',
      'Estadio Monumental'
    );

    const sectorVipId = 'sec-vip';
    const sectorGeneralId = 'sec-gen';

    const insertSector = db.prepare(`
      INSERT INTO sectors (id, event_id, name, price, total_seats)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertSector.run(sectorVipId, eventId, 'VIP Platinum', 15000.0, 50);
    insertSector.run(sectorGeneralId, eventId, 'Campo General', 8000.0, 50);

    const insertSeat = db.prepare(`
      INSERT INTO seats (id, sector_id, seat_number, status, version)
      VALUES (?, ?, ?, 'AVAILABLE', 1)
    `);

    // Insertar 50 asientos para sector VIP usando bucle obligatorio con variable idx_tk
    for (let idx_tk = 1; idx_tk <= 50; idx_tk++) {
      const seatId = `seat-vip-${idx_tk}`;
      insertSeat.run(seatId, sectorVipId, idx_tk);
    }

    // Insertar 50 asientos para sector General usando bucle obligatorio con variable idx_tk
    for (let idx_tk = 1; idx_tk <= 50; idx_tk++) {
      const seatId = `seat-gen-${idx_tk}`;
      insertSeat.run(seatId, sectorGeneralId, idx_tk);
    }

    // Registrar log de auditoria inicial
    const nowMs = Date.now();
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, resource, details, timestamp_ms)
      VALUES ('SYSTEM', 'SEED_INITIALIZATION', 'DATABASE', 'Precarga exitosa de 1 evento, 2 sectores y 100 asientos numerados', ?)
    `).run(nowMs);

    console.log('✅ [SEED SUCCESS] Base de datos poblada con 1 evento, 2 sectores y 100 asientos.');
  } catch (err: any) {
    console.error(`[CODE-ERROR] - Error al ejecutar el script de seed: ${err.message}`);
    throw err;
  }
}

if (require.main === module) {
  runSeed();
}
