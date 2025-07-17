// src/controllers/vendorPricing.controller.ts
import { Request, Response } from "express"
import { updateVendorPricing, getVendorPricing } from "../services/vendorPricing.service"

export const setVendorPricing = async (req: Request, res: Response) => {
  try {
    // 1. Extract pricing from request body
    const pricing = req.body.pricing;

    // 2. Validate pricing presence
    if (!pricing)
      return res.status(400).json({ error: "Pricing data is required" });

    // 3. Update vendor's pricing using service
    const updated = await updateVendorPricing(req.user!.id, pricing);

    // 4. Respond with success
    res.json({
      success: true,
      message: "Pricing updated",
      data: updated
    });
  } catch (err: any) {
    // 5. Handle errors
    res.status(400).json({ error: err.message });
  }
};

export const fetchVendorPricing = async (req: Request, res: Response) => {
  try {
    // 1. Fetch vendor pricing using user ID
    const pricing = await getVendorPricing(req.user!.id);

    // 2. Return pricing data
    res.json({ success: true, data: pricing });
  } catch (err: any) {
    // 3. Handle error
    res.status(400).json({ error: err.message });
  }
};

