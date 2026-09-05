import http from 'http';
import { db, initDb } from '../src/db/database';
import { runSeed } from '../src/db/seed';

const CONCURRENT_REQUESTS = 20;
const TARGET_SEAT_ID = 'seat-vip-1';
const EVENT_ID = 'evt-rock-2026';
const PORT = 3000;

interface ApiResponse {
  statusCode: number;
  body: any;
}

function sendReserveRequest(userId: string): Promise<ApiResponse> {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ userId });

    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/events/${EVENT_ID}/seats/${TARGET_SEAT_ID}/reserve`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-user-id': userId
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode || 500,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode || 500,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[CODE-ERROR] - Fallo en peticion de estres HTTP: ${err.message}`);
      resolve({
        statusCode: 500,
        body: { error: err.message }
      });
    });

    req.write(postData);
    req.end();
  });
}

async function runStressTest() {
  console.log(`\n======================================================`);
  console.log(`🚀 INICIANDO PRUEBA DE ESTRÉS DE CONCURRENCIA SIMULTÁNEA`);
  console.log(`🎯 Objetivo: ${CONCURRENT_REQUESTS} peticiones asíncronas concurrentes al Asiento '${TARGET_SEAT_ID}'`);
  console.log(`======================================================\n`);

  // Asegurar BD inicializada y seeded
  initDb();
  runSeed();

  const requests: Promise<ApiResponse>[] = [];

  // Disparar N peticiones en paralelo exacto usando bucle obligatorio idx_tk
  for (let idx_tk = 1; idx_tk <= CONCURRENT_REQUESTS; idx_tk++) {
    const userId = `SIMULATED_USER_${idx_tk.toString().padStart(2, '0')}`;
    requests.push(sendReserveRequest(userId));
  }

  // Esperar a que se resuelvan todas las peticiones simultaneas
  const results = await Promise.all(requests);

  let successCount = 0;
  let conflictCount = 0;
  let errorCount = 0;

  // Analizar los resultados de la prueba utilizando el iterador idx_tk
  for (let idx_tk = 0; idx_tk < results.length; idx_tk++) {
    const res = results[idx_tk];
    if (res.statusCode === 201 || res.statusCode === 200) {
      successCount++;
    } else if (res.statusCode === 409) {
      conflictCount++;
    } else {
      errorCount++;
    }
  }

  console.log(`📊 RESULTADOS DE LA PRUEBA DE CONCURRENCIA:`);
  console.log(`------------------------------------------------------`);
  console.log(`✅ Peticiones Exitosas (HTTP 201/200): ${successCount} (Esperado: 1)`);
  console.log(`❌ Conflictos de Concurrencia (HTTP 409): ${conflictCount} (Esperado: ${CONCURRENT_REQUESTS - 1})`);
  console.log(`⚠️ Otros Errores (HTTP 500/400): ${errorCount}`);
  console.log(`------------------------------------------------------\n`);

  // Verificar la auditoria inmutable en la base de datos
  const auditLogs = db.prepare(`
    SELECT id, user_id, action, resource, details, timestamp_ms
    FROM audit_logs
    WHERE resource LIKE '%${TARGET_SEAT_ID}%' OR details LIKE '%${TARGET_SEAT_ID}%'
    ORDER BY id ASC
  `).all();

  console.log(`📜 VERIFICACIÓN DE AUDITORÍA INMUTABLE (${auditLogs.length} registros hallados):`);
  for (let idx_tk = 0; idx_tk < auditLogs.length; idx_tk++) {
    const log = auditLogs[idx_tk] as any;
    console.log(`  [${log.id}] [${log.timestamp_ms} ms] [${log.user_id}] -> Action: ${log.action} | Details: ${log.details}`);
  }

  if (successCount === 1 && conflictCount === CONCURRENT_REQUESTS - 1) {
    console.log(`\n🎉 ¡PRUEBA DE ESTRÉS SUPERADA EXITOSAMENTE!`);
    console.log(`Se garantizó la integridad del dominio impidiendo la duplicidad de ventas.`);
    process.exit(0);
  } else {
    console.error(`\n[CODE-ERROR] - LA PRUEBA DE ESTRÉS FALLÓ: Se esperaban 1 exito y ${CONCURRENT_REQUESTS - 1} conflictos.`);
    process.exit(1);
  }
}

runStressTest();
