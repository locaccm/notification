import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  console.error(err.stack);
  res.status(status).json({ error: message });
};
