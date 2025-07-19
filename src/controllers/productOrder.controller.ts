import { Request, Response } from "express";
import * as ProductOrderService from "../services/productOrder.service";
import { createNotification } from "../services/notification.service";

export const checkoutCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const order = await ProductOrderService.checkoutCart(userId!);

    await createNotification(userId!, `Your order of ₦${order.total} was placed successfully.`);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully using SHARP-PAY",
      data: order,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
