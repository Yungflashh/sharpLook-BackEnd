import { Request, Response } from "express"
import { createProduct } from "../services/product.service"
import uploadToCloudinary from "../utils/cloudinary"
import { getVendorProducts, getAllProducts, getTopSellingProducts, deleteProduct, updateProduct  } from "../services/product.service"


export const addProduct = async (req: Request, res: Response) => {
  const { productName, description } = req.body;
  const price = parseFloat(req.body.price);
  const qtyAvailable = parseInt(req.body.qtyAvailable);

  if (!productName || isNaN(price) || isNaN(qtyAvailable)) {
    return res.status(400).json({
      success: false,
      message: "Product name, price, and quantity are required and must be valid"
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Product image is required"
    });
  }

  try {
    const cloudRes = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    const product = await createProduct(
      req.user!.id,
      productName,
      price,
      qtyAvailable,
      description,
      cloudRes.secure_url,
     
    );

    return res.status(201).json({
      success: true,
      message: "Product posted successfully",
      data: product
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to upload product"
    });
  }
};


export const fetchVendorProducts = async (req: Request, res: Response) => {
  try {
    const products = await getVendorProducts(req.user!.id);
    return res.status(200).json({
      success: true,
      message: "Vendor products fetched successfully",
      data: products
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const fetchAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await getAllProducts();
    return res.status(200).json({
      success: true,
      message: "All products fetched successfully",
      data: products
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const fetchTopSellingProducts = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const products = await getTopSellingProducts(limit);
    return res.status(200).json({
      success: true,
      message: "Top selling products fetched successfully",
      data: products
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const editProduct = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user?.id;
    const { productId } = req.params;
    const { productName, price, qtyAvailable, description } = req.body;

    if (!productName || !price || qtyAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    let pictureUrl: string | undefined = undefined;

    if (req.file) {
      const cloudinaryRes = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      pictureUrl = cloudinaryRes.secure_url;
    }

    const updatedProduct = await updateProduct(
      productId,
      vendorId!,
      productName,
      Number(price),
      Number(qtyAvailable),
      description,
      pictureUrl,
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (err: any) {
    console.error("Error editing product:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update product"
    });
  }
};


export const removeProduct = async (req: Request, res: Response) => {
  const { productId } = req.body;

  try {
    await deleteProduct(productId);
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
