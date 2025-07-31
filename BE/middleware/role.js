function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    console.log("Role authorization check:")
    console.log("User role:", req.user?.role)
    console.log("Allowed roles:", allowedRoles)

    if (!req.user || !req.user.role) {
      console.log("No user or role found")
      return res.status(401).json({ message: "Unauthorized: No user data" })
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log("Role not authorized")
      return res.status(403).json({
        message: `Unauthorized: Role '${req.user.role}' not allowed. Required: ${allowedRoles.join(", ")}`,
      })
    }

    console.log("Role authorized")
    next()
  }
}

module.exports = authorizeRoles
