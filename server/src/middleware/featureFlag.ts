import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { prisma } from "../utils/prisma";

// Module key → feature flag key mapping
const MODULE_FLAG_MAP: Record<string, string> = {
  appointments: "appointments",
  pharmacy:     "pharmacy",
  lab:          "lab",
  billing:      "billing",
  notifications:"notifications",
  "audit-logs": "audit_logs",
  files:        "file_uploads",
  reports:      "reports",
};

/**
 * requireFeature(module)
 * Middleware that checks whether the feature flag for a module is enabled for
 * the current organization. SUPER_ADMIN bypasses all checks.
 *
 * Usage: router.use(requireFeature("pharmacy"))
 */
export function requireFeature(module: string) {
  const flagKey = MODULE_FLAG_MAP[module] ?? module;

  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    // Super admin & requests without an org context are always allowed
    if (req.user?.role === "SUPER_ADMIN" || !req.user?.organizationId) {
      return next();
    }

    try {
      const flag = await prisma.featureFlag.findUnique({
        where: {
          key_organizationId: {
            key: flagKey,
            organizationId: req.user.organizationId,
          },
        },
      });

      // If no flag row exists, default to ENABLED (opt-out model)
      if (!flag || flag.isEnabled) {
        return next();
      }

      return next(Object.assign(new Error(`Module '${module}' is disabled for your organization`), { statusCode: 403 }));
    } catch (err) {
      next(err);
    }
  };
}
