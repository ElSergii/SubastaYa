import { db } from '../db/database';

export interface AuditRecord {
  id?: number;
  userId: string;
  action: string;
  resource: string;
  details: string;
  timestampMs: number;
  createdAt?: string;
}

export class AuditService {
  public static logAction(userId: string, action: string, resource: string, details: string): number {
    try {
      const nowMs = Date.now();
      const stmt = db.prepare(`
        INSERT INTO audit_logs (user_id, action, resource, details, timestamp_ms)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = stmt.run(userId, action, resource, details, nowMs);
      return Number(info.lastInsertRowid);
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo al guardar registro de auditoria: ${err.message}`);
      throw err;
    }
  }

  public static getLogs(limit: number = 100): AuditRecord[] {
    try {
      const stmt = db.prepare(`
        SELECT id, user_id as userId, action, resource, details, timestamp_ms as timestampMs, created_at as createdAt
        FROM audit_logs
        ORDER BY id DESC
        LIMIT ?
      `);
      const rows = stmt.all(limit) as AuditRecord[];
      return rows;
    } catch (err: any) {
      console.error(`[CODE-ERROR] - Fallo al consultar registros de auditoria: ${err.message}`);
      throw err;
    }
  }
}
