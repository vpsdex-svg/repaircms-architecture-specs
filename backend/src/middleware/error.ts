import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = "ERROR", details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, message, "BAD_REQUEST", details);
export const unauthorized = (message = "Authentication required") =>
  new HttpError(401, message, "UNAUTHORIZED");
export const forbidden = (message = "Insufficient permissions") =>
  new HttpError(403, message, "FORBIDDEN");
export const notFound = (message = "Resource not found") => new HttpError(404, message, "NOT_FOUND");
export const conflict = (message: string, details?: unknown) =>
  new HttpError(409, message, "CONFLICT", details);

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Payload validation failed", details: err.flatten() },
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Unexpected server error";
  console.error("[api] unhandled error:", err);
  res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message } });
}
