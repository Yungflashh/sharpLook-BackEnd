import { Role } from "@prisma/client";

// Middleware factory to restrict access to specific roles
export const requireAdminRole = (...allowedRoles: Role[]) => {
  return (req: any, res: any, next: any) => {
    try {
      const user = req.user; // Ensure `verifyToken` middleware runs first

      if (!user) {
        return res.status(401).json({ message: "Unauthorized. No user info found." });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: `Access denied. Required roles: [${allowedRoles.join(", ")}], but you have: ${user.role}`,
        });
      }

      next();
    } catch (err) {
      console.error("Role middleware error:", err);
      return res.status(500).json({ message: "Server error in role check middleware." });
    }
  };
};
