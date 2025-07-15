// src/controllers/promotion.controller.ts
import { Request, Response } from "express"
import * as PromotionService from "../services/promotion.service"

export const createPromotion = async (req: Request, res: Response) => {
  const { title, description, discountPercentage, startDate, endDate } = req.body
  const vendorId = req.user!.id

  try {
    const promo = await PromotionService.createPromotion(
      vendorId,
      title,
      description,
      parseFloat(discountPercentage),
      new Date(startDate),
      new Date(endDate)
    )
    res.status(201).json({ success: true, data: promo })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const getMyPromotions = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user!.id
    const promos = await PromotionService.getActivePromotions()
    res.json({ success: true, data: promos })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const getAllActivePromotions = async (_: Request, res: Response) => {
  try {
    const promos = await PromotionService.getActivePromotions()
    res.json({ success: true, data: promos })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const changePromotionStatus = async (req: Request, res: Response) => {
  const { promotionId } = req.params
  const { isActive } = req.body

  try {
    const promo = await PromotionService.togglePromotionStatus(promotionId, isActive)
    res.json({ success: true, data: promo })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
