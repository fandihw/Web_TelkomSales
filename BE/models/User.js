const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    telegram_id: { type: String, unique: true, sparse: true }, // ID Telegram user
    role: { type: String, enum: ["superadmin", "admin", "sales"], default: "sales" },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("User", userSchema)
