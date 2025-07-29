const express = require("express")
const router = express.Router()
const User = require("../models/User")
const authenticateToken = require("../middleware/auth")
const authorizeRoles = require("../middleware/role")

// GET all users - hanya untuk admin dan superadmin
router.get("/users", authenticateToken, authorizeRoles("admin", "superadmin"), async (req, res) => {
  try {
    console.log("👥 Fetching all users by:", req.user.email)

    // Ambil semua user kecuali password
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 })

    console.log("✅ Users fetched:", users.length, "users")

    res.json(users)
  } catch (error) {
    console.error("❌ Error fetching users:", error)
    res.status(500).json({ message: "Server error: " + error.message })
  }
})

// DELETE user by ID - hanya untuk superadmin
router.delete("/users/:id", authenticateToken, authorizeRoles("superadmin"), async (req, res) => {
  try {
    const { id } = req.params
    console.log("🗑️ Deleting user:", id, "by:", req.user.email)

    // Cek apakah user yang akan dihapus ada
    const userToDelete = await User.findById(id)
    if (!userToDelete) {
      console.log("❌ User not found:", id)
      return res.status(404).json({ message: "User tidak ditemukan" })
    }

    // Cegah penghapusan diri sendiri
    if (userToDelete._id.toString() === req.user.id.toString()) {
      console.log("❌ User trying to delete themselves:", req.user.email)
      return res.status(400).json({ message: "Tidak dapat menghapus akun sendiri" })
    }

    // Hapus user
    await User.findByIdAndDelete(id)

    console.log("✅ User deleted successfully:", userToDelete.email)

    res.json({ 
      message: "User berhasil dihapus",
      deletedUser: {
        id: userToDelete._id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role
      }
    })
  } catch (error) {
    console.error("❌ Error deleting user:", error)
    
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID user tidak valid" })
    }
    
    res.status(500).json({ message: "Server error: " + error.message })
  }
})

// GET user by ID - untuk detail user
router.get("/users/:id", authenticateToken, authorizeRoles("admin", "superadmin"), async (req, res) => {
  try {
    const { id } = req.params
    console.log("👤 Fetching user:", id)

    const user = await User.findById(id, { password: 0 })
    if (!user) {
      console.log("❌ User not found:", id)
      return res.status(404).json({ message: "User tidak ditemukan" })
    }

    console.log("✅ User fetched:", user.email)
    res.json(user)
  } catch (error) {
    console.error("❌ Error fetching user:", error)
    
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID user tidak valid" })
    }
    
    res.status(500).json({ message: "Server error: " + error.message })
  }
})

module.exports = router