import { Request, Response } from "express"
import * as WishlistService from "../services/wishlist.service"

export const addProductToWishlist = async (req: Request, res: Response) => {
  // 1. Get user ID and product ID from request
  const userId = req.user!.id;
  const { productId } = req.body;

  // 2. Validate input
  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    // 3. Add to wishlist
    const item = await WishlistService.addToWishlist(userId, productId);

    // 4. Return success response
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    // 5. Handle errors
    res.status(500).json({ error: err.message });
  }
};

export const getMyWishlist = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    // 1. Fetch wishlist
    const wishlist = await WishlistService.getUserWishlist(userId);

    // 2. Return wishlist
    res.json({ success: true, data: wishlist });
  } catch (err: any) {
    // 3. Handle errors
    res.status(500).json({ error: err.message });
  }
};

export const removeProductFromWishlist = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.params;

  try {
    // 1. Remove from wishlist
    await WishlistService.removeFromWishlist(userId, productId);

    // 2. Return confirmation
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err: any) {
    // 3. Handle errors
    res.status(500).json({ error: err.message });
  }
};
