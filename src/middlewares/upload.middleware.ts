// src/middlewares/multer.ts
import multer from "multer"

const storage = multer.memoryStorage()

const upload = multer({ storage })

export const uploadSingle = upload.single("identityImage")
export const uploadMultiple = upload.array("portfolioImages", 10) 
