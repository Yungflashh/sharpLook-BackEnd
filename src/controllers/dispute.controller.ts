import { Request, Response } from "express";
import * as DisputeService from "../services/dispute.service";
import { uploadDisputeImage } from "../middlewares/upload.middleware";
import uploadBufferToCloudinary from "../utils/cloudinary";


export const raiseDispute = [
  uploadDisputeImage,
  async (req: Request, res: Response) => {
    const { bookingId, reason } = req.body;
    const userId = req.user?.id!;
    try {
      let imageUrl: string | undefined;
      if (req.file) {
        const result = await uploadBufferToCloudinary(req.file.buffer, "hairdesign/vendors");
        imageUrl = result.secure_url;
      }

      const dispute = await DisputeService.createDispute(
        bookingId,
        userId,
        reason,
        imageUrl
      );

      res.status(201).json({ success: true, message: "Dispute submitted", dispute });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Dispute creation failed" });
    }
  }
];

export const getDisputes = async (_req: Request, res: Response) => {
  try {
    const disputes = await DisputeService.getAllDisputes();
    res.json({ success: true, disputes });
  } catch (error) {
    console.error("Failed to get disputes:", error);
    res.status(500).json({ success: false, message: "Failed to fetch disputes" });
  }
};

export const resolveDispute = async (req: Request, res: Response) => {

  const { status, resolution, id } = req.body;

  if (!["RESOLVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const updated = await DisputeService.updateDisputeStatus(id, status as any, resolution);
    res.json({ success: true, message: `Dispute ${status.toLowerCase()}`, dispute: updated });
  } catch (error) {
    console.error("Failed to update dispute:", error);
    res.status(500).json({ success: false, message: "Failed to update dispute" });
  }
};
