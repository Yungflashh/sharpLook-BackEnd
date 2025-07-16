import { Request, Response } from "express"
import { createProduct } from "../services/product.service"
import uploadToCloudinary from "../utils/cloudinary"
import { getVendorProducts, getAllProducts, getTopSellingProducts } from "../services/product.service"


export const addProduct = async (req: Request, res: Response) => {
        const { productName } = req.body
        const price = parseFloat(req.body.price)
        const qtyAvailable = parseInt(req.body.qtyAvailable)

       console.log(typeof(price));
        
      console.log( typeof( qtyAvailable));
       
//         if (isNaN(price) || isNaN(qtyAvailable)) {
//   return res.status(400).json({ error: "Price and quantity must be valid numbers" })
// }

  if (!req.file) {
    return res.status(400).json({ error: "Product image is required" })
  }

  try {
    const cloudRes = await uploadToCloudinary(req.file.buffer, req.file.mimetype)
    const product = await createProduct(
      req.user!.id,
      productName,
      price,
     qtyAvailable,
      cloudRes.secure_url
    )

    res.status(201).json({ success: true, message: "Product posted", data: product })
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to upload product" })
  }
}

export const fetchVendorProducts = async (req: Request, res: Response) => {
  try {
    const products = await getVendorProducts(req.user!.id)
    res.json({ success: true, data: products })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const fetchAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await getAllProducts()
    res.json({ success: true, data: products })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}


export const fetchTopSellingProducts = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10

  try {
    const products = await getTopSellingProducts(limit)
    res.json({ success: true, data: products })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}