import { Request, Response } from "express"
import * as WishlistService from "../services/wishlist.service"

export const addProductToWishlist = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { productId } = req.body

  if (!productId) return res.status(400).json({ error: "Product ID is required" })

  try {
    const item = await WishlistService.addToWishlist(userId, productId)
    res.status(201).json({ success: true, data: item })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getMyWishlist = async (req: Request, res: Response) => {
  const userId = req.user!.id

  try {
    const wishlist = await WishlistService.getUserWishlist(userId)
    res.json({ success: true, data: wishlist })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const removeProductFromWishlist = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { productId } = req.params

  try {
    await WishlistService.removeFromWishlist(userId, productId)
    res.json({ success: true, message: "Removed from wishlist" })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
