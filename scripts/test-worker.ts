import { db, initDb } from '../src/db/database';
import { runSeed } from '../src/db/seed';
import { ReservationWorker } from '../src/workers/reservationWorker';

function testWorkerAutoRelease() {
  console.log(`\n======================================================`);
  console.log(`🧪 PROBANDO WORKER DE LIBERACIÓN AUTOMÁTICA (>5 MIN)`);
  console.log(`======================================================\n`);

  initDb();
  runSeed();

  const seatId = 'seat-gen-10';
  const userId = 'TEST_EXPIRED_USER';
  const resId = 'res-test-expired-123';

  // 1. Marcar asiento como RESERVED
  db.prepare(`UPDATE seats SET status = 'RESERVED' WHERE id = ?`).run(seatId);

  // 2. Insertar reserva expirada hace 10 minutos
  const pastExpiresAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  db.prepare(`
    INSERT INTO reservations (id, seat_id, user_id, status, expires_at)
    VALUES (?, ?, ?, 'ACTIVE', ?)
  `).run(resId, seatId, userId, pastExpiresAt);

  console.log(`📝 Reserva creada en estado ACTIVE pero con expiración pasada (${pastExpiresAt})`);

  // 3. Ejecutar el worker de liberacion
  const released = ReservationWorker.releaseExpiredReservations();

  // 4. Verificar resultado
  const seatAfter = db.prepare(`SELECT status, version FROM seats WHERE id = ?`).get(seatId) as any;
  const resAfter = db.prepare(`SELECT status FROM reservations WHERE id = ?`).get(resId) as any;

  console.log(`\n📊 VERIFICACIÓN TRAS EJECUCIÓN DEL WORKER:`);
  console.log(`- Reservas liberadas por el worker: ${released}`);
  console.log(`- Estado final de la reserva: '${resAfter.status}' (Esperado: 'EXPIRED')`);
  console.log(`- Estado final del asiento: '${seatAfter.status}' (Esperado: 'AVAILABLE')`);

  const auditLog = db.prepare(`
    SELECT * FROM audit_logs WHERE action = 'AUTO_RELEASE_EXPIRED' ORDER BY id DESC LIMIT 1
  `).get() as any;

  if (auditLog) {
    console.log(`📜 Registro de Auditoría Generado:`);
    console.log(`  [${auditLog.id}] [${auditLog.timestamp_ms} ms] [${auditLog.user_id}] -> ${auditLog.action}: ${auditLog.details}`);
  }

  if (released === 1 && resAfter.status === 'EXPIRED' && seatAfter.status === 'AVAILABLE' && auditLog) {
    console.log(`\n🎉 ¡PRUEBA DEL WORKER SUPERADA EXITOSAMENTE!`);
  } else {
    console.error(`\n[CODE-ERROR] - LA PRUEBA DEL WORKER FALLÓ.`);
    process.exit(1);
  }
}

testWorkerAutoRelease();
