"use strict";
// import { Request, Response } from "express"
// import { getPastBookings, getUpcomingBookings } from "../services/history.service"
// export const fetchPastHistory = async (req: Request, res: Response) => {
//   try {
//     const role = req.user!.role
//     const userId = req.user!.id
//     const history = await getPastBookings(userId, role)
//     res.json({ success: true, data: history })
//   } catch (err: any) {
//     res.status(500).json({ error: err.message })
//   }
// }
// export const fetchUpcomingHistory = async (req: Request, res: Response) => {
//   try {
//     const role = req.user!.role
//     const userId = req.user!.id
//     const history = await getUpcomingBookings(userId, role)
//     res.json({ success: true, data: history })
//   } catch (err: any) {
//     res.status(500).json({ error: err.message })
//   }
// }
