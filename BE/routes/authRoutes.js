const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const authenticateToken = require("../middleware/auth")
const authorizeRoles = require("../middleware/role")

// Login route dengan logging yang lebih detail
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    console.log("🔐 Login attempt:")
    console.log("   Email:", `"${email}"`)
    console.log("   Password length:", password ? password.length : 0)

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return res.status(400).json({ message: "Email dan password wajib diisi" })
    }

    // Debug: cek semua user di database
    const allUsers = await User.find({})
    console.log("📊 Total users in database:", allUsers.length)
    allUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. "${u.email}" (${u.role}) - Telegram: ${u.telegram_id || "N/A"}`)
    })

    // Cari user dengan email yang tepat
    const user = await User.findOne({ email: email.trim() })
    console.log("🔍 User search result:", user ? "FOUND" : "NOT FOUND")

    if (!user) {
      console.log("❌ User not found for email:", `"${email}"`)

      // Cek apakah ada user dengan email mirip
      const similarUsers = await User.find({
        email: { $regex: email.replace("@", ""), $options: "i" },
      })
      if (similarUsers.length > 0) {
        console.log("💡 Similar emails found:")
        similarUsers.forEach((u) => console.log(`   - "${u.email}"`))
      }

      return res.status(400).json({ message: "Email atau password salah" })
    }

    console.log("✅ User found:")
    console.log("   ID:", user._id)
    console.log("   Name:", user.name)
    console.log("   Email:", `"${user.email}"`)
    console.log("   Role:", user.role)
    console.log("   Telegram ID:", user.telegram_id || "N/A")

    // Test password
    const isMatch = await bcrypt.compare(password, user.password)
    console.log("🔐 Password check:", isMatch ? "✅ VALID" : "❌ INVALID")

    if (!isMatch) {
      console.log("❌ Invalid password for user:", user.email)
      return res.status(400).json({ message: "Email atau password salah" })
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        telegram_id: user.telegram_id,
      },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "24h" },
    )

    console.log("✅ Login successful for:", user.email)

    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        telegram_id: user.telegram_id,
      },
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    res.status(500).json({ message: "Server error: " + error.message })
  }
})

// Register route
router.post("/register", authenticateToken, authorizeRoles("superadmin"), async (req, res) => {
  try {
    console.log("👤 Register attempt by user:", req.user.id)

    const { name, email, password, role, telegram_id } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Nama, email, password, dan role wajib diisi" })
    }

    // Validasi telegram_id untuk role sales
    if (role === "sales" && !telegram_id) {
      return res.status(400).json({ message: "ID Telegram wajib diisi untuk role Sales" })
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.trim() })
    if (existingUser) {
      console.log("❌ Email already exists:", email)
      return res.status(400).json({ message: "Email sudah terdaftar" })
    }

    // Check if telegram_id already exists (jika diisi)
    if (telegram_id) {
      const existingTelegramUser = await User.findOne({ telegram_id: telegram_id.trim() })
      if (existingTelegramUser) {
        console.log("❌ Telegram ID already exists:", telegram_id)
        return res.status(400).json({ message: "ID Telegram sudah terdaftar" })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role,
      telegram_id: telegram_id ? telegram_id.trim() : null,
    })

    await newUser.save()

    console.log("✅ User registered successfully:")
    console.log("   Email:", newUser.email)
    console.log("   Role:", newUser.role)
    console.log("   Telegram ID:", newUser.telegram_id || "N/A")

    res.json({ message: "User berhasil didaftarkan" })
  } catch (error) {
    console.error("❌ Register error:", error)
    res.status(500).json({ message: "Server error: " + error.message })
  }
})

module.exports = router
