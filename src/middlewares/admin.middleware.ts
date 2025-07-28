import { Role, AdminRole } from "@prisma/client"; // Adjust if needed based on your enum setup

// Middleware factory to restrict access to specific admin roles
export const requireAdminRole = (...allowedRoles: any) => {
  return (req :any, res: any, next: any) => {
    try {
      const user = req.user; // Ensure `verifyToken` ran before this middleware

      if (!user) {
        return res.status(401).json({ message: "Unauthorized. No user info found." });
      }

      if (user.role !== Role.ADMIN && user.role !== Role.SUPERADMIN) {
        return res.status(403).json({ message: "Access denied. Not an admin user." });
      }

      const userAdminRole = user.adminRole;

      console.log(userAdminRole);
      

      // if (!allowedRoles.includes(userAdminRole)) {
      //   return res.status(403).json({
      //     message: `Access denied. Required roles: [${allowedRoles.join(", ")}], but you have: ${userAdminRole}`,
      //   });
      // }

      next();
    } catch (err) {
      console.error("Admin role middleware error:", err);
      return res.status(500).json({ message: "Server error in role check middleware." });
    }
  };
};
