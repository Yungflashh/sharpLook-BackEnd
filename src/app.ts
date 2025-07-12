
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import vendorRoutes from "./routes/vendor.routes"
import userRoutes from "./routes/user.routes"
import bookingRoutes from "./routes/booking.routes"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/v1/vendor", vendorRoutes)
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/bookings", bookingRoutes)
app.get("/", (_, res) => res.send("🚀 Hairdresser API is running"))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
