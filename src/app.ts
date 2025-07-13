
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import vendorRoutes from "./routes/vendor.routes"
import userRoutes from "./routes/user.routes"
import bookingRoutes from "./routes/booking.routes"
import productRoutes from "./routes/product.routes"
import earningsRoutes from "./routes/earnings.routes"
import notificationsRoutes from "./routes/notification.routes"
import reviewRoutes from "./routes/review.routes"



dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/v1/vendor", vendorRoutes)
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/bookings", bookingRoutes)
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/earnings", earningsRoutes)
app.use("/api/v1/notifications", notificationsRoutes)

app.get("/", (_, res) => res.send("🚀 SharpLook API is running"))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
