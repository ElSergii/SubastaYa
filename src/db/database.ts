import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../database.sqlite');
export const db = new Database(dbPath, { verbose: undefined });

// Habilitar el modo Write-Ahead Logging (WAL) para mejorar la concurrencia
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb(): void {
  try {
    // 1. Tabla de Eventos
    db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        location TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla de Sectores
    db.exec(`
      CREATE TABLE IF NOT EXISTS sectors (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        total_seats INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );
    `);

    // 3. Tabla de Asientos / Butacas (con campo version para Optimistic Locking)
    db.exec(`
      CREATE TABLE IF NOT EXISTS seats (
        id TEXT PRIMARY KEY,
        sector_id TEXT NOT NULL,
        seat_number INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('AVAILABLE', 'RESERVED', 'SOLD')),
        version INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sector_id) REFERENCES sectors (id) ON DELETE CASCADE
      );
    `);

    // Index para consultas rapidas de asientos por sector
    db.exec(`CREATE INDEX IF NOT EXISTS idx_seats_sector_id ON seats(sector_id);`);

    // 4. Tabla de Reservas
    db.exec(`
      CREATE TABLE IF NOT EXISTS reservations (
        id TEXT PRIMARY KEY,
        seat_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'COMPLETED', 'EXPIRED')),
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seat_id) REFERENCES seats (id) ON DELETE CASCADE
      );
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_reservations_status_expires ON reservations(status, expires_at);`);

    // 5. Tabla de Auditoria Inmutable
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp_ms INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err: any) {
    console.error(`[CODE-ERROR] - Fallo al inicializar la base de datos: ${err.message}`);
    throw err;
  }
}
