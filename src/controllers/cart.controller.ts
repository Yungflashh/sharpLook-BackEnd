import { Request, Response } from "express"
import * as CartService from "../services/cart.service"

export const addProductToCart = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { productId } = req.body

  if (!productId) return res.status(400).json({ error: "Product ID is required" })

  try {
    const cartItem = await CartService.addToCart(userId, productId)
    res.status(201).json({ success: true, data: cartItem })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getMyCart = async (req: Request, res: Response) => {
  const userId = req.user!.id

  try {
    const cart = await CartService.getUserCart(userId)
    res.json({ success: true, data: cart })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const removeProductFromCart = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { productId } = req.params

  try {
    await CartService.removeFromCart(userId, productId)
    res.json({ success: true, message: "Removed from cart" })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
