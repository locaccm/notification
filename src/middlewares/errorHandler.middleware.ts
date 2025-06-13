import { Request, Response, NextFunction } from "express";

// logs the stack trace, and sends a JSON response with the error message and status code.
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  console.error(err.stack);
  res.status(status).json({ error: message });
  void next;
};
