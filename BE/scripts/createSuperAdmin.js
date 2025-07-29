const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
require("dotenv").config()

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/sales_visit_db")
    console.log("✅ Connected to MongoDB")

    // Delete existing super admin to avoid duplicates
    await User.deleteMany({ role: "superadmin" })
    console.log("🗑️ Removed existing super admin accounts")

    // Hash password properly
    const password = "superadmin123"
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create super admin with consistent email
    const superAdmin = await User.create({
      name: "Super Admin",
      email: "superadmin@superadmin.com", // Konsisten dengan login
      password: hashedPassword,
      role: "superadmin",
    })

    console.log("✅ Super Admin created successfully:")
    console.log("📧 Email:", superAdmin.email)
    console.log("🔑 Password:", password)
    console.log("👤 Role:", superAdmin.role)
    console.log("🆔 ID:", superAdmin._id)

    // Verify the user was created
    const verifyUser = await User.findOne({ email: "superadmin@superadmin.com" })
    if (verifyUser) {
      console.log("✅ Verification: User found in database")

      // Test password
      const passwordMatch = await bcrypt.compare(password, verifyUser.password)
      console.log("🔐 Password test:", passwordMatch ? "✅ VALID" : "❌ INVALID")
    } else {
      console.log("❌ Verification: User NOT found in database")
    }
  } catch (error) {
    console.error("❌ Error creating Super Admin:", error)
  } finally {
    mongoose.connection.close()
  }
}

createSuperAdmin()
