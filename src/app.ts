
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
import promotionRoutes from "./routes/promotion.routes"
import messageRoutes from "./routes/message.routes"
import vendorServiceRoutes from "./routes/vendorService.routes"
import historyRoutes from "./routes/history.routes"



// For clients


import clientServiceRoutes from "./routes/clientService.routes"
import cartRoutes from "./routes/cart.routes"








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
app.use("/api/v1/reviews", reviewRoutes)
app.use("/api/v1/promotions", promotionRoutes)
app.use("/api/v1/messages", messageRoutes)
app.use("/api/v1/vendorServices", vendorServiceRoutes)


// For clients 

app.use("/api/v1/client", clientServiceRoutes)
app.use("/api/v1/client", cartRoutes)
app.use("/api/history", historyRoutes)


app.get("/", (_, res) => res.send("🚀 SharpLook API is running"))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})


export default app