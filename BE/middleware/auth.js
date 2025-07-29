const jwt = require("jsonwebtoken")
const User = require("../models/User")

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    console.log("🔑 Token authentication:")
    console.log("   Auth header:", authHeader ? "EXISTS" : "MISSING")
    console.log("   Token:", token ? "EXISTS" : "MISSING")

    if (!token) {
      console.log("❌ No token provided")
      return res.status(401).json({ message: "Access token required" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key")
    console.log("✅ Token decoded:", { id: decoded.id, role: decoded.role })

    // Get user from database to ensure user still exists
    const user = await User.findById(decoded.id)
    if (!user) {
      console.log("❌ User not found in database")
      return res.status(401).json({ message: "User not found" })
    }

    // Add user info to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    }

    console.log("✅ User authenticated:", req.user.email)
    next()
  } catch (error) {
    console.log("❌ Token verification failed:", error.message)

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" })
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" })
    }

    return res.status(401).json({ message: "Token verification failed" })
  }
}

module.exports = authenticateToken
