/// <reference path="../types/express/index.d.ts" />
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

interface JwtPayload {
  id: string
  role: string
  adminRole: string
}

    export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" })
      }

      const token = authHeader.split(" ")[1]

      try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
        req.user = decoded

        
        console.log(req.user);
        
        next()
      } catch (err) {
        res.status(401).json({ error: "Invalid token" })
      }
    }

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden: Access denied" })
    }
    next()
  }
}
