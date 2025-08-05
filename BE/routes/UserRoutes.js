console.log("🔧 UserRoutes.js loaded successfully")

const express = require("express")
const router = express.Router()
const User = require("../models/User")
const authenticateToken = require("../middleware/auth")
const authorizeRoles = require("../middleware/role")

// Debug: Log semua routes yang didefinisikan
console.log("📋 Defining user routes:")
console.log("   - GET /users")
console.log("   - DELETE /users/:id")
console.log("   - PUT /users/:id")
console.log("   - GET /users/:id")

// GET all users - hanya untuk admin dan superadmin
router.get("/users", authenticateToken, authorizeRoles("admin", "superadmin"), async (req, res) => {
  try {
    console.log("Fetching all users by:", req.user.email)

    // Ambil semua user kecuali password
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 })

    console.log("Users fetched:", users.length, "users")

    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Server error: " + error.message })
  }
})

// DELETE user by ID - hanya untuk superadmin
router.delete("/users/:id", authenticateToken, authorizeRoles("superadmin"), async (req, res) => {
  try {
    const { id } = req.params
    console.log("Deleting user:", id, "by:", req.user.email)

    // Cek apakah user yang akan dihapus ada
    const userToDelete = await User.findById(id)
    if (!userToDelete) {
      console.log("User not found:", id)
      return res.status(404).json({ message: "User tidak ditemukan" })
    }

    // Cegah penghapusan diri sendiri
    if (userToDelete._id.toString() === req.user.id.toString()) {
      console.log("User trying to delete themselves:", req.user.email)
      return res.status(400).json({ message: "Tidak dapat menghapus akun sendiri" })
    }

    // Hapus user
    await User.findByIdAndDelete(id)

    console.log("User deleted successfully:", userToDelete.email)

    res.json({
      message: "User berhasil dihapus",
      deletedUser: {
        id: userToDelete._id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role,
      },
    })
  } catch (error) {
    console.error("Error deleting user:", error)

    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID user tidak valid" })
    }

    res.status(500).json({ message: "Server error: " + error.message })
  }
})

// UPDATE user by ID - hanya untuk superadmin
router.put("/users/:id", authenticateToken, authorizeRoles("superadmin"), async (req, res) => {
  try {
    const { id } = req.params
    const { email, password } = req.body

    console.log("=== PUT /api/users/:id called ===")
    console.log("User ID:", id)
    console.log("Request body:", { email, password: password ? "***" : "not provided" })
    console.log("Updating user:", id, "by:", req.user.email)

    // Validasi input
    if (!email) {
      console.log("❌ Email validation failed: Email wajib diisi")
      return res.status(400).json({ message: "Email wajib diisi" })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Email validation failed: Format email tidak valid")
      return res.status(400).json({ message: "Format email tidak valid" })
    }

    // Password validation (jika diisi)
    if (password && password.length < 6) {
      console.log("❌ Password validation failed: Password minimal 6 karakter")
      return res.status(400).json({ message: "Password minimal 6 karakter" })
    }

    // Cek apakah user yang akan diupdate ada
    console.log("🔍 Looking for user with ID:", id)
    const userToUpdate = await User.findById(id)
    if (!userToUpdate) {
      console.log("❌ User not found:", id)
      return res.status(404).json({ message: "User tidak ditemukan" })
    }

    console.log("✅ User found:", userToUpdate.email)

    // Cek apakah email sudah digunakan user lain
    const existingUser = await User.findOne({
      email: email.trim(),
      _id: { $ne: id }, // exclude current user
    })
    if (existingUser) {
      console.log("Email already exists:", email)
      return res.status(400).json({ message: "Email sudah digunakan oleh user lain" })
    }

    // Prepare update data
    const updateData = {
      email: email.trim(),
    }

    // Hash password jika diisi
    if (password) {
      const bcrypt = require("bcryptjs")
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: "-password" }, // return updated user without password
    )

    console.log("User updated successfully:", updatedUser.email)

    res.json({
      message: "User berhasil diupdate",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user:", error)

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
    console.log("Fetching user:", id)

    const user = await User.findById(id, { password: 0 })
    if (!user) {
      console.log("User not found:", id)
      return res.status(404).json({ message: "User tidak ditemukan" })
    }

    console.log("User fetched:", user.email)
    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)

    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID user tidak valid" })
    }

    res.status(500).json({ message: "Server error: " + error.message })
  }
})

console.log("✅ UserRoutes.js finished defining routes and exporting router")
module.exports = router