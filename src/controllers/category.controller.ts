import { Request, Response, NextFunction } from "express";
import { createServiceCategory, getAllServiceCategories } from "../services/category.service";

export const handleCreateServiceCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Service name is required" });

    const category = await createServiceCategory(name);
    res.status(201).json({
      success: true,
      message: "Service category created successfully",
      data: category,
    });
  } catch (error: any) {
    if (
      error.code === "P2002" &&
      error.meta?.target?.includes("name")
    ) {
      return res.status(409).json({ success: false, message: "Service category already exists" });
    }
    next(error);
  }
};

export const handleGetServiceCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await getAllServiceCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
