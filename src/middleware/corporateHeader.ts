import { Request, Response, NextFunction } from 'express';

export function corporateHeaderMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    res.setHeader('X-Api-version', '1.0');
    next();
  } catch (err: any) {
    console.error(`[CODE-ERROR] - Error al establecer el encabezado corporativo: ${err.message}`);
    next(err);
  }
}
