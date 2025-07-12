import { JwtPayload } from "jsonwebtoken"
import { Request } from "express"
import { Multer } from "multer"

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string; role: string }
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    file?: Express.Multer.File
  }
}
export {}
