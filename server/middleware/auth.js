import { extractBearerToken, verifyToken } from "../auth.js";

export function createAuthenticate(store) {
  return async function authenticate(req, res, next) {
    try {
      const token = extractBearerToken(req.headers.authorization);

      if (!token) {
        return res.status(401).json({ message: "Authentication is required." });
      }

      const payload = verifyToken(token);
      const user = await store.findUserById(payload.sub);

      if (!user) {
        return res.status(401).json({ message: "Your session is no longer valid." });
      }

      req.auth = {
        userId: user.id,
        isAdmin: user.isAdmin,
      };

      req.currentUser = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Authentication is required." });
    }
  };
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
      return next();
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
