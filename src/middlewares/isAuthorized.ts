// middleware/isAuthorized.ts
import { Request, Response, NextFunction } from 'express';
import { Role, AdminRole } from '@prisma/client';


export const isAuthorized = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !roles.includes(user.role as Role)) {
      return res.status(403).json({ message: "Forbidden: Unauthorized access" });
    }

    next();
  };
};


export const requireAdminRole = (adminRoles: AdminRole[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Admins only' });
    }

    if (adminRoles.length && !adminRoles.includes(user.adminRole)) {
      return res.status(403).json({ message: 'Forbidden: Not enough admin privileges' });
    }

    next();
  };
};
