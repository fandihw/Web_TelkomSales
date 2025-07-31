const express = require("express")
const router = express.Router()
const VisitData = require("../models/VisitData")

// GET semua data visit
router.get("/visit-data", async (req, res) => {
  try {
    console.log("VISIT-DATA Fetching all visit data...")
    console.log("VISIT-DATA Request timestamp:", new Date().toISOString())
    console.log("VISIT-DATA Request headers:", req.headers)

    const data = await VisitData.find({}).sort({ timestamp: -1 }).lean().exec()

    console.log("VISIT-DATA data fetched:", data.length, "records")

    // Debug: tampilkan 3 record terbaru
    if (data.length > 0) {
      console.log("🔍 [VISIT-DATA] Latest 3 records:")
      data.slice(0, 3).forEach((record, index) => {
        console.log(`   ${index + 1}. ID: ${record._id}, Timestamp: ${record.timestamp}, POI: ${record.poi_name}`)
      })
    }

    // Set headers
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
      ETag: `"${Date.now()}"`,
      "Last-Modified": new Date().toUTCString(),
    })

    // Tambahkan timestamp
    const response = {
      data: data,
      meta: {
        count: data.length,
        timestamp: new Date().toISOString(),
        server_time: Date.now(),
        endpoint: "/api/visit-data",
      },
    }

    console.log("VISIT-DATA Sending response with", data.length, "records")
    res.json(response)
  } catch (err) {
    console.error("VISIT-DATA Error fetching visit data:", err)
    res.status(500).json({
      message: "Error fetching visit data",
      error: err.message,
      endpoint: "/api/visit-data",
    })
  }
})

// POST - tambah data visit baru
router.post("/visit-data", async (req, res) => {
  try {
    console.log("VISIT-DATA Adding new visit data:", req.body)

    const visitData = new VisitData({
      ...req.body,
      timestamp: new Date(),
    })

    const savedData = await visitData.save()

    console.log("VISIT-DATA saved:", savedData._id)

    res.status(201).json(savedData)
  } catch (err) {
    console.error("VISIT-DATA Error saving visit data:", err)
    res.status(500).json({
      message: "Error saving visit data",
      error: err.message,
    })
  }
})

module.exports = router