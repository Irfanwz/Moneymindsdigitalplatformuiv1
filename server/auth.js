import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { config } from "./config.js";

export const availableRoles = ["startup", "investor", "advisor"];
export const approvalStatuses = ["pending", "approved", "rejected"];

export function normalizeRoles(roles) {
  if (!Array.isArray(roles)) {
    return [];
  }

  return [...new Set(
    roles
      .map((role) => (typeof role === "string" ? role.trim().toLowerCase() : ""))
      .filter((role) => availableRoles.includes(role)),
  )];
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    config.jwtSecret,
    { expiresIn: "7d" },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    location: user.location,
    bio: user.bio,
    status: user.status,
    requestedRoles: user.requestedRoles,
    approvedRoles: user.approvedRoles,
    isAdmin: user.isAdmin,
    adminNotes: user.adminNotes,
    rejectionReason: user.rejectionReason,
    approvedAt: user.approvedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function extractBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== "string") {
    return null;
  }

  const [scheme, token] = headerValue.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}
