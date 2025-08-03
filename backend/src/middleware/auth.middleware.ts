import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    confinamento_id: string;
  };
}

export const validateJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTH_REQUIRED",
          message: "Bearer token required",
          timestamp: new Date().toISOString(),
        },
      });
    }

    const token = authHeader.split(" ")[1];

    // Validate with Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn("Invalid JWT token", {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        error: error?.message,
      });

      return res.status(401).json({
        success: false,
        error: {
          code: "AUTH_INVALID",
          message: "Invalid or expired token",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Get user permissions
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role, confinamento_id")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole) {
      logger.warn("User has no permissions", {
        userId: user.id,
        email: user.email,
      });

      return res.status(403).json({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "No permissions assigned",
          timestamp: new Date().toISOString(),
        },
      });
    }

    req.user = {
      id: user.id,
      email: user.email!,
      role: userRole.role,
      confinamento_id: userRole.confinamento_id,
    };

    logger.debug("User authenticated", {
      userId: user.id,
      email: user.email,
      role: userRole.role,
      endpoint: req.path,
    });

    next();
  } catch (error) {
    logger.error("JWT validation error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(500).json({
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: "Authentication service error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

// Role-based authorization middleware
export const authorize = (requiredRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTH_REQUIRED",
          message: "Authentication required",
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (!requiredRoles.includes(req.user.role)) {
      logger.warn("Insufficient permissions", {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles,
        endpoint: req.path,
      });

      return res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: `Requires one of: ${requiredRoles.join(", ")}`,
          timestamp: new Date().toISOString(),
        },
      });
    }

    next();
  };
};

// Confinamento-specific authorization
export const authorizeConfinamento = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const confinamentoId = req.params.confinamento_id || req.body.confinamento_id;

  if (!confinamentoId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "MISSING_CONFINAMENTO_ID",
        message: "Confinamento ID is required",
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (req.user?.confinamento_id !== confinamentoId) {
    logger.warn("Confinamento access denied", {
      userId: req.user?.id,
      userConfinamento: req.user?.confinamento_id,
      requestedConfinamento: confinamentoId,
    });

    return res.status(403).json({
      success: false,
      error: {
        code: "CONFINAMENTO_ACCESS_DENIED",
        message: "Access denied to this confinamento",
        timestamp: new Date().toISOString(),
      },
    });
  }

  next();
};
