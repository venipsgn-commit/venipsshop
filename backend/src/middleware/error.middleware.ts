import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${err.message}`);
  const status = (err as any).status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Erreur serveur' : err.message,
  });
};
