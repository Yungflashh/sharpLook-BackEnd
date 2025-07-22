import express from "express";
import {calculateDistance} from "../controllers/distance.controller"
import { verifyToken } from "../middlewares/auth.middleware";


const router = express.Router()





router.post("/calcDistance", verifyToken, calculateDistance)


export default router