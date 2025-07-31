const express = require("express")
const router = express.Router()
const VisitData = require("../models/VisitData")
const User = require("../models/User")
const authenticateToken = require("../middleware/auth")

// GET data untuk user yang login (sales) - berdasarkan telegram_id
router.get("/data/my-data", authenticateToken, async (req, res) => {
  try {
    console.log("👤 Fetching user data for:", req.user.id)
    console.log("   User telegram_id:", req.user.telegram_id)

    // Ambil user dari database untuk mendapatkan telegram_id
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" })
    }

    if (!user.telegram_id) {
      console.log("User tidak memiliki telegram_id")
      return res.json([]) 
    }

    // Cari data berdasarkan telegram_id atau user_id yang match dengan telegram_id
    const data = await VisitData.find({
      $or: [{ telegram_id: user.telegram_id }, { user_id: user.telegram_id }],
    }).sort({ timestamp: -1 })

    console.log("User data fetched:", data.length, "records for telegram_id:", user.telegram_id)

    res.json(data)
  } catch (err) {
    console.error("Error fetching user data:", err)
    res.status(500).json({
      message: "Error fetching user data",
      error: err.message,
    })
  }
})

// GET semua data untuk admin/superadmin
router.get("/data/all-data", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching all data by admin:", req.user.id)

    // Cek apakah user adalah admin atau superadmin
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Akses ditolak. Hanya admin yang dapat melihat semua data." })
    }

    const data = await VisitData.find().sort({ timestamp: -1 })

    console.log("All data fetched:", data.length, "records")

    res.json(data)
  } catch (err) {
    console.error("Error fetching all data:", err)
    res.status(500).json({
      message: "Error fetching all data",
      error: err.message,
    })
  }
})

module.exports = router
