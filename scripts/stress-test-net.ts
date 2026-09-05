import http from 'http';

const CONCURRENT_REQUESTS = 20;
const TARGET_SEAT_ID = 'seat-vip-1';
const EVENT_ID = 'evt-rock-2026';
const PORT = 5000;

interface ApiResponse {
  statusCode: number;
  body: any;
}

function resetDb(): Promise<void> {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/admin/reset-database',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, () => resolve());
    req.on('error', () => resolve());
    req.end();
  });
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
      console.error(`[CODE-ERROR] - Fallo en petición HTTP a ASP.NET Core: ${err.message}`);
      resolve({
        statusCode: 500,
        body: { error: err.message }
      });
    });

    req.write(postData);
    req.end();
  });
}

async function runDotnetStressTest() {
  console.log(`\n======================================================`);
  console.log(`🚀 PRUEBA DE ESTRÉS DE CONCURRENCIA (.NET 9 + SQL SERVER)`);
  console.log(`🎯 Objetivo: ${CONCURRENT_REQUESTS} peticiones asíncronas concurrentes al Asiento '${TARGET_SEAT_ID}'`);
  console.log(`======================================================\n`);

  await resetDb();

  const requests: Promise<ApiResponse>[] = [];

  // Disparar N peticiones en paralelo exacto usando bucle obligatorio idx_tk
  for (let idx_tk = 1; idx_tk <= CONCURRENT_REQUESTS; idx_tk++) {
    const userId = `SIMULATED_USER_${idx_tk.toString().padStart(2, '0')}`;
    requests.push(sendReserveRequest(userId));
  }

  const results = await Promise.all(requests);

  let successCount = 0;
  let conflictCount = 0;
  let errorCount = 0;

  // Analizar los resultados utilizando el iterador idx_tk
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

  console.log(`📊 RESULTADOS DE LA PRUEBA EN ASP.NET CORE 9 + SQL SERVER:`);
  console.log(`------------------------------------------------------`);
  console.log(`✅ Peticiones Exitosas (HTTP 201/200): ${successCount} (Esperado: 1)`);
  console.log(`❌ Conflictos de Concurrencia (HTTP 409): ${conflictCount} (Esperado: ${CONCURRENT_REQUESTS - 1})`);
  console.log(`⚠️ Otros Errores (HTTP 500/400): ${errorCount}`);
  console.log(`------------------------------------------------------\n`);

  if (successCount === 1 && conflictCount === CONCURRENT_REQUESTS - 1) {
    console.log(`🎉 ¡PRUEBA DE ESTRÉS EN .NET 9 + SQL SERVER SUPERADA EXITOSAMENTE!`);
    process.exit(0);
  } else {
    console.error(`[CODE-ERROR] - PRUEBA DE ESTRÉS EN .NET 9 FALLÓ.`);
    process.exit(1);
  }
}

runDotnetStressTest();
