import { Request, Response, NextFunction } from "express";

// Global error handler middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
};
