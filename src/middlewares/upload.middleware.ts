// src/middlewares/multer.ts
import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

export const uploadSingle = upload.single("identityImage");
export const uploadSingle2 = upload.single("serviceImage");
export const uploadSingle3 = upload.single("avatar");
export const uploadDisputeImage = upload.single("disputeImage");
export const uploadMultiple = upload.array("portfolioImages", 10);
