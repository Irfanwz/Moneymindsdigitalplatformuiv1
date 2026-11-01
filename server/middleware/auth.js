import { extractBearerToken, verifyToken } from "../auth.js";
import { adminCan } from '../../shared/adminPermissions.js';

export function createAuthenticate(store) {
  return async function authenticate(req, res, next) {
    try {
      // Accept token from HttpOnly cookie first, fall back to Authorization header
      const token = req.cookies?.["mm_token"] || extractBearerToken(req.headers.authorization);

      if (!token) {
        return res.status(401).json({ message: "Authentication is required." });
      }

      const payload = verifyToken(token);
      const user = await store.findUserById(payload.sub);

      if (!user) {
        return res.status(401).json({ message: "Your session is no longer valid." });
      }

      if (user.isSuspended) return res.status(403).json({code:'ACCOUNT_SUSPENDED',message:'Your account is suspended. Please contact the administrator.'});
      if (!user.isAdmin && user.status !== 'approved') return res.status(403).json({message:'An approved account is required.'});
      if (!user.isAdmin && (await store.getAdminSettings()).maintenanceMode) return res.status(503).json({message:'MoneyMinds is undergoing maintenance. Please try again later.'});

      req.auth = {
        userId: user.id,
        isAdmin: user.isAdmin,
      };

      req.currentUser = user;
      next();
    } catch (error) {
      if (['JsonWebTokenError','TokenExpiredError','NotBeforeError'].includes(error.name)) return res.status(401).json({ message: "Authentication is required." });
      next(error);
    }
  };
}

export function requirePermission(permission) {
  return (req,res,next) => adminCan(req.currentUser,permission) ? next() : res.status(403).json({message:'Your administrator role does not allow this action.'});
}

export function requireAdmin(req, res, next) {
  if (!req.auth?.isAdmin) {
    return res.status(403).json({ message: "Admin access is required." });
  }

  next();
}

export function requireApprovedRole(role) {
  return function approvedRoleMiddleware(req, res, next) {
    if (req.currentUser?.isAdmin) {
      return adminCan(req.currentUser,'settings') ? next() : res.status(403).json({message:'Your administrator role does not allow this action.'});
    }

    if (
      req.currentUser?.status !== "approved" ||
      !req.currentUser?.approvedRoles?.includes(role)
    ) {
      return res.status(403).json({
        message: `An approved ${role} account is required.`,
      });
    }

    next();
  };
}
