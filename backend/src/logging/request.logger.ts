import { Request, Response, NextFunction } from "express";
import winston from "winston";
import { v4 as uuidv4 } from "uuid";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "development"
          ? winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          : winston.format.json(),
    }),
    ...(process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: "logs/requests.log",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
        ]
      : []),
  ],
});

interface RequestWithId extends Request {
  requestId?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    confinamento_id: string;
  };
}

export const requestLogger = (
  req: RequestWithId,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const requestId = (req.headers["x-request-id"] as string) || uuidv4();

  // Add request ID to request object
  req.requestId = requestId;

  // Add request ID to response headers
  res.setHeader("X-Request-ID", requestId);

  logger.info("Request started", {
    requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    confinamentoId: req.user?.confinamento_id,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    bodySize: req.headers["content-length"]
      ? parseInt(req.headers["content-length"])
      : undefined,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;

    logger.info("Request completed", {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      confinamentoId: req.user?.confinamento_id,
      responseSize: res.getHeader("content-length")
        ? parseInt(res.getHeader("content-length") as string)
        : undefined,
    });

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logging middleware
export const errorLogger = (
  error: Error,
  req: RequestWithId,
  res: Response,
  next: NextFunction
) => {
  logger.error("Request error", {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    error: error.message,
    stack: error.stack,
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    confinamentoId: req.user?.confinamento_id,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  next(error);
};

// Audit logging for sensitive operations
export const auditLogger = (operation: string, details?: any) => {
  return (req: RequestWithId, res: Response, next: NextFunction) => {
    logger.info("Audit log", {
      requestId: req.requestId,
      operation,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      confinamentoId: req.user?.confinamento_id,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      details,
    });

    next();
  };
};

// Performance logging for slow requests
export const performanceLogger = (thresholdMs: number = 1000) => {
  return (req: RequestWithId, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - startTime;

      if (duration > thresholdMs) {
        logger.warn("Slow request detected", {
          requestId: req.requestId,
          method: req.method,
          url: req.originalUrl,
          duration,
          thresholdMs,
          userId: req.user?.id,
          userEmail: req.user?.email,
          userRole: req.user?.role,
          confinamentoId: req.user?.confinamento_id,
        });
      }
    });

    next();
  };
};

export { logger };
