import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { initDb } from './db/database';
import { runSeed } from './db/seed';
import { corporateHeaderMiddleware } from './middleware/corporateHeader';
import { apiRouter } from './routes/api';
import { swaggerSpec } from './swagger';
import { ReservationWorker } from './workers/reservationWorker';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de parseo y CORS
app.use(cors());
app.use(express.json());

// REQUERIMIENTO CORPORATIVO 3: Inyectar middleware global para el header X-Api-version: 1.0
app.use(corporateHeaderMiddleware);

// Archivos estaticos para la interfaz Frontend
app.use(express.static(path.join(__dirname, '../public')));

// Documentacion Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la API RESTful v1
app.use('/api/v1', apiRouter);

// Manejador global de errores con prefijo obligatorio [CODE-ERROR] -
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[CODE-ERROR] - Error no capturado en la aplicacion: ${err.message || err}`);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor.'
  });
});

// Inicializar BD y Seed de datos si es necesario
initDb();
runSeed();

// Iniciar Background Job para auto-liberacion de reservas vencidas
ReservationWorker.start(5000);

export const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutandose en http://localhost:${PORT}`);
  console.log(`📑 Documentacion OpenAPI/Swagger accesible en http://localhost:${PORT}/api-docs`);
});
