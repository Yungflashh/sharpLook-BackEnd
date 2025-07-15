// src/middlewares/admin.middleware.ts
import { Request, Response, NextFunction } from "express"

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const role = req.user?.role

  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return res.status(403).json({ error: "Forbidden: Admins only" })
  }

  next()
}
