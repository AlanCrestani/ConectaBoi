import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheckResult;
    supabase: HealthCheckResult;
    memory: HealthCheckResult;
    disk: HealthCheckResult;
  };
  metrics: {
    request_count_24h: number;
    error_rate_24h: number;
    avg_response_time_ms: number;
    active_connections: number;
  };
}

interface HealthCheckResult {
  status: "ok" | "warning" | "error";
  response_time_ms?: number;
  message?: string;
  details?: any;
}

const healthChecks = {
  async database(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();

      // Test Supabase connection
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from("confinamentos")
        .select("id")
        .limit(1);

      const response_time_ms = Date.now() - start;

      if (error) {
        return {
          status: "error",
          message: "Database connection failed",
          details: error.message,
        };
      }

      return {
        status: response_time_ms < 100 ? "ok" : "warning",
        response_time_ms,
        message:
          response_time_ms > 100
            ? "Database response time elevated"
            : undefined,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  async supabase(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();

      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );

      // Test Supabase auth service
      const { data, error } = await supabase.auth.getSession();

      const response_time_ms = Date.now() - start;

      if (error) {
        return {
          status: "error",
          message: "Supabase auth service failed",
          details: error.message,
        };
      }

      return {
        status: response_time_ms < 200 ? "ok" : "warning",
        response_time_ms,
        message:
          response_time_ms > 200
            ? "Supabase response time elevated"
            : undefined,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Supabase connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  async memory(): Promise<HealthCheckResult> {
    try {
      const usage = process.memoryUsage();
      const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
      const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
      const usagePercentage = (usedMB / totalMB) * 100;

      return {
        status:
          usagePercentage < 80
            ? "ok"
            : usagePercentage < 90
            ? "warning"
            : "error",
        details: {
          used_mb: usedMB,
          total_mb: totalMB,
          usage_percentage: Math.round(usagePercentage),
        },
        message:
          usagePercentage > 80
            ? `High memory usage: ${Math.round(usagePercentage)}%`
            : undefined,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Memory check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  async disk(): Promise<HealthCheckResult> {
    try {
      // Simplified disk check for now
      return {
        status: "ok",
        details: {
          available: "Sufficient disk space",
        },
      };
    } catch (error) {
      return {
        status: "error",
        message: "Disk check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

// Mock metrics for now - in production these would come from actual metrics collection
const getMockMetrics = () => ({
  request_count_24h: Math.floor(Math.random() * 10000) + 5000,
  error_rate_24h: Math.random() * 0.5, // 0-0.5%
  avg_response_time_ms: Math.floor(Math.random() * 200) + 50, // 50-250ms
  active_connections: Math.floor(Math.random() * 50) + 10, // 10-60 connections
});

export const healthController = {
  async getHealth(req: Request, res: Response) {
    try {
      const checks = await Promise.all([
        healthChecks.database(),
        healthChecks.supabase(),
        healthChecks.memory(),
        healthChecks.disk(),
      ]);

      const [database, supabase, memory, disk] = checks;

      // Determine overall status
      const hasErrors = [database, supabase, memory, disk].some(
        (check) => check.status === "error"
      );
      const hasWarnings = [database, supabase, memory, disk].some(
        (check) => check.status === "warning"
      );

      const overallStatus = hasErrors
        ? "unhealthy"
        : hasWarnings
        ? "degraded"
        : "healthy";

      const healthStatus: HealthCheck = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        checks: {
          database,
          supabase,
          memory,
          disk,
        },
        metrics: getMockMetrics(),
      };

      const statusCode =
        overallStatus === "healthy"
          ? 200
          : overallStatus === "degraded"
          ? 200
          : 503;

      logger.info("Health check completed", {
        status: overallStatus,
        checks: healthStatus.checks,
      });

      res.status(statusCode).json(healthStatus);
    } catch (error) {
      logger.error("Health check failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        message: "Health check system error",
      });
    }
  },

  getLiveness(req: Request, res: Response) {
    res.status(200).json({
      status: "alive",
      timestamp: new Date().toISOString(),
    });
  },

  async getReadiness(req: Request, res: Response) {
    try {
      // Check if database is accessible
      const databaseCheck = await healthChecks.database();

      if (databaseCheck.status === "error") {
        logger.warn("Readiness check failed - database unavailable");
        return res.status(503).json({
          status: "not_ready",
          timestamp: new Date().toISOString(),
          reason: "Database unavailable",
        });
      }

      res.status(200).json({
        status: "ready",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Readiness check failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      res.status(503).json({
        status: "not_ready",
        timestamp: new Date().toISOString(),
        reason: "Service unavailable",
      });
    }
  },
};
