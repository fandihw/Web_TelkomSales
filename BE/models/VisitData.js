const mongoose = require("mongoose")

const visitDataSchema = new mongoose.Schema(
  {
    step: String,
    kategori: String,
    nama_sales: String,
    telda: String,
    sto: String,
    kegiatan: String,
    poi_name: String,
    address: String,
    ekosistem: String,
    contact_name: String,
    contact_position: String,
    contact_phone: String,
    provider: String,
    provider_detail: String,
    cost: String,
    feedback: String,
    feedback_detail: String,
    detail_info: String,
    photo_url: String,
    user_id: String, // ID dari bot telegram (bukan MongoDB _id)
    telegram_id: String, // ID Telegram user yang input data
    visit_ke: Number,
    timestamp: Date,
  },
  {
    collection: "visit_data",
    timestamps: true,
  },
)

module.exports = mongoose.model("VisitData", visitDataSchema)
