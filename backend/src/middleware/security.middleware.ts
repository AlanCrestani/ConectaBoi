import { Request, Response, NextFunction } from "express";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export const securityMiddleware = [
  // Block suspicious user agents
  (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.headers["user-agent"] || "";
    const suspiciousAgents = [
      "sqlmap",
      "nikto",
      "nmap",
      "masscan",
      "dirb",
      "gobuster",
      "wpscan",
      "joomscan",
      "acunetix",
      "burp",
      "zap",
    ];

    if (
      suspiciousAgents.some((agent) => userAgent.toLowerCase().includes(agent))
    ) {
      logger.error("Suspicious user agent blocked", {
        ip: req.ip,
        userAgent,
        path: req.path,
      });
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Access denied",
        },
      });
    }

    next();
  },

  // Check for SQL injection patterns
  (req: Request, res: Response, next: NextFunction) => {
    const sqlInjectionPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    ];

    const queryString = req.url;
    const bodyString = JSON.stringify(req.body || {});

    if (
      sqlInjectionPatterns.some(
        (pattern) => pattern.test(queryString) || pattern.test(bodyString)
      )
    ) {
      logger.error("SQL injection attempt blocked", {
        ip: req.ip,
        path: req.path,
        query: req.query,
        userAgent: req.headers["user-agent"],
      });
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Malicious request detected",
        },
      });
    }

    next();
  },

  // Check for XSS patterns
  (req: Request, res: Response, next: NextFunction) => {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>/gi,
    ];

    const queryString = req.url;
    const bodyString = JSON.stringify(req.body || {});

    if (
      xssPatterns.some(
        (pattern) => pattern.test(queryString) || pattern.test(bodyString)
      )
    ) {
      logger.error("XSS attempt blocked", {
        ip: req.ip,
        path: req.path,
        query: req.query,
        userAgent: req.headers["user-agent"],
      });
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Malicious request detected",
        },
      });
    }

    next();
  },

  // Rate limiting by IP for sensitive endpoints
  (req: Request, res: Response, next: NextFunction) => {
    const sensitiveEndpoints = ["/api/v1/auth", "/api/v1/mobile/sync"];
    const isSensitive = sensitiveEndpoints.some((endpoint) =>
      req.path.startsWith(endpoint)
    );

    if (isSensitive) {
      // Additional rate limiting for sensitive endpoints
      // This would typically be implemented with Redis
      logger.debug("Sensitive endpoint accessed", {
        ip: req.ip,
        path: req.path,
        userAgent: req.headers["user-agent"],
      });
    }

    next();
  },

  // Content length validation
  (req: Request, res: Response, next: NextFunction) => {
    const maxContentLength = 10 * 1024 * 1024; // 10MB

    if (req.headers["content-length"]) {
      const contentLength = parseInt(req.headers["content-length"]);

      if (contentLength > maxContentLength) {
        logger.error("Request too large", {
          ip: req.ip,
          contentLength,
          maxContentLength,
          path: req.path,
        });
        return res.status(413).json({
          success: false,
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: "Request too large",
          },
        });
      }
    }

    next();
  },

  // Request method validation
  (req: Request, res: Response, next: NextFunction) => {
    const allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];

    if (!allowedMethods.includes(req.method)) {
      logger.error("Invalid HTTP method", {
        ip: req.ip,
        method: req.method,
        path: req.path,
      });
      return res.status(405).json({
        success: false,
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "Method not allowed",
        },
      });
    }

    next();
  },

  // Add security headers
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()"
    );

    next();
  },
];
