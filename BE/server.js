const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware dengan anti-cache
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // Vite default port
    credentials: true,
  }),
)

// Disable caching globally
app.use((req, res, next) => {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  })
  next()
})

app.use(express.json())

// MongoDB Connection minimal
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sales_visit_db"
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB")
    console.log("📍 Database:", MONGODB_URI)
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
  })

// Import routes
const authRoutes = require("./routes/authRoutes")
const visitDataRoutes = require("./routes/visitDataRoutes")
const dataRoutes = require("./routes/dataRoutes")
const photoRoutes = require("./routes/photoRoutes")
const userRoutes = require("./routes/UserRoutes")

// Use Routes
app.use("/api/auth", authRoutes)
app.use("/api", visitDataRoutes)
app.use("/api", dataRoutes)
app.use("/api", photoRoutes)
app.use("/api", userRoutes) // Pastikan ini ada dan benar

// Temporary test PUT route
app.put("/api/test-put/:id", (req, res) => {
  console.log("✅ Temporary PUT /api/test-put/:id hit!")
  console.log("Params:", req.params)
  console.log("Body:", req.body)
  res.json({ message: `Test PUT successful for ID: ${req.params.id}`, receivedBody: req.body })
})

// Health check endpoint dengan timestamp
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    server_time: Date.now(),
    endpoints: [
      "GET /api/health",
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET /api/visit-data",
      "GET /api/data/my-data",
      "GET /api/photo/:filename",
      "GET /api/photos/:telegram_id",
      "GET /api/photo-detail/:filename",
      "GET /api/users",
      "PUT /api/users/:id", // Tambahkan ini
      "DELETE /api/users/:id",
      "GET /api/users/:id",
      "PUT /api/test-put/:id (Temporary Test Route)", // Tambahkan ini
    ],
  })
})

// 404 handler
app.use("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      "GET /api/health",
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET /api/visit-data",
      "GET /api/data/my-data",
      "GET /api/photo/:filename",
      "GET /api/photos/:telegram_id",
      "GET /api/photo-detail/:filename",
      "GET /api/users",
      "PUT /api/users/:id",
      "DELETE /api/users/:id",
      "GET /api/users/:id",
      "PUT /api/test-put/:id (Temporary Test Route)",
    ],
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  })
})

// Start server
app.listen(PORT, () => {
  console.log("Server running on port", PORT)
  console.log("Health check: http://localhost:" + PORT + "/api/health")
  console.log("Available endpoints:")
  console.log("   - POST http://localhost:" + PORT + "/api/auth/login")
  console.log("   - POST http://localhost:" + PORT + "/api/auth/register")
  console.log("   - GET  http://localhost:" + PORT + "/api/visit-data")
  console.log("   - GET  http://localhost:" + PORT + "/api/data/my-data")
  console.log("   - GET  http://localhost:" + PORT + "/api/photo/:filename")
  console.log("   - GET  http://localhost:" + PORT + "/api/photos/:telegram_id")
  console.log("   - GET  http://localhost:" + PORT + "/api/photo-detail/:filename")
  console.log("   - GET  http://localhost:" + PORT + "/api/users")
  console.log("   - PUT  http://localhost:" + PORT + "/api/users/:id")
  console.log("   - DELETE http://localhost:" + PORT + "/api/users/:id")
  console.log("   - GET  http://localhost:" + PORT + "/api/users/:id")
  console.log("   - PUT  http://localhost:" + PORT + "/api/test-put/:id (Temporary Test Route)")
  console.log("-----------------------------------\n")
})