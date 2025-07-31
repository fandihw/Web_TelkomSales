const express = require("express")
const router = express.Router()
const path = require("path")
const fs = require("fs")

// Route untuk serve foto dari folder
router.get("/photo/:filename", (req, res) => {
  try {
    const { filename } = req.params

    // Path ke folder photos
    const botPhotosPath = "D:\\111111KP\\TUGAS_MAGANG\\SalesTeleBot_Mongo\\photos" // Path absolut ke folder photos
    const filePath = path.join(botPhotosPath, filename)

    console.log("Requesting photo:", filename)
    console.log("Photo path:", filePath)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log("Photo not found:", filePath)
      return res.status(404).json({ message: "Photo not found" })
    }

    // Check file extension for security
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"]
    const fileExtension = path.extname(filename).toLowerCase()

    if (!allowedExtensions.includes(fileExtension)) {
      console.log("Invalid file type:", fileExtension)
      return res.status(400).json({ message: "Invalid file type" })
    }

    // Set appropriate content type
    const contentType =
      {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
      }[fileExtension] || "image/jpeg"

    res.setHeader("Content-Type", contentType)
    res.setHeader("Cache-Control", "public, max-age=86400")

    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)

    console.log("Photo served successfully:", filename)
  } catch (error) {
    console.error("Error serving photo:", error)
    res.status(500).json({ message: "Error serving photo", error: error.message })
  }
})

// Route untuk list semua foto berdasarkan telegram_id
router.get("/photos/:telegram_id", (req, res) => {
  try {
    const { telegram_id } = req.params

    // Path ke folder photos
    const botPhotosPath = "D:\\111111KP\\TUGAS_MAGANG\\SalesTeleBot_Mongo\\photos"

    console.log("Listing photos for telegram_id:", telegram_id)
    console.log("Photos directory:", botPhotosPath)

    if (!fs.existsSync(botPhotosPath)) {
      console.log("Photos directory not found:", botPhotosPath)
      return res.status(404).json({ message: "Photos directory not found" })
    }

    const files = fs.readdirSync(botPhotosPath)
    const userPhotos = files.filter((file) => {
      return (
        file.startsWith(`${telegram_id}_`) &&
        [".jpg", ".jpeg", ".png", ".gif"].includes(path.extname(file).toLowerCase())
      )
    })

    console.log("Found photos:", userPhotos.length)

    const photoUrls = userPhotos.map((filename) => ({
      filename,
      url: `/api/photo/${filename}`,
      fullUrl: `http://localhost:5000/api/photo/${filename}`,
    }))

    res.json({
      telegram_id,
      photos: photoUrls,
      count: photoUrls.length,
    })
  } catch (error) {
    console.error("Error listing photos:", error)
    res.status(500).json({ message: "Error listing photos", error: error.message })
  }
})

// Route baru untuk mencari foto berdasarkan kriteria yang lebih spesifik
router.post("/photo-match", (req, res) => {
  try {
    const { telegram_id, poi_name, timestamp, photo_filename } = req.body

    // Path ke folder photos
    const botPhotosPath = "D:\\111111KP\\TUGAS_MAGANG\\SalesTeleBot_Mongo\\photos"

    console.log("Advanced photo matching:")
    console.log("Telegram ID:", telegram_id)
    console.log("POI Name:", poi_name)
    console.log("Timestamp:", timestamp)
    console.log("Photo filename:", photo_filename)

    if (!fs.existsSync(botPhotosPath)) {
      console.log("Photos directory not found:", botPhotosPath)
      return res.status(404).json({ message: "Photos directory not found" })
    }

    const files = fs.readdirSync(botPhotosPath)
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"]

    const userFiles = files.filter((file) => {
      const fileExtension = path.extname(file).toLowerCase()
      return allowedExtensions.includes(fileExtension) && file.startsWith(`${telegram_id}_`)
    })

    console.log("User files found:", userFiles.length)

    if (userFiles.length === 0) {
      return res.status(404).json({
        message: "No photos found for this telegram_id",
        telegram_id,
        availableFiles: files.filter((f) => allowedExtensions.includes(path.extname(f).toLowerCase())).slice(0, 10),
      })
    }

    let matchedFile = null
    let matchReason = ""

    if (photo_filename && photo_filename !== "-") {
      const cleanFilename = photo_filename.split(/[/\\]/).pop()
      matchedFile = userFiles.find((file) => file === cleanFilename)
      if (matchedFile) {
        matchReason = "exact_filename_match"
      }
    }

    if (!matchedFile && photo_filename && photo_filename !== "-") {
      const cleanFilename = photo_filename.replace(/\.[^/.]+$/, "") 
      matchedFile = userFiles.find(
        (file) => file.includes(cleanFilename) || cleanFilename.includes(file.replace(/\.[^/.]+$/, "")),
      )
      if (matchedFile) {
        matchReason = "partial_filename_match"
      }
    }

    if (!matchedFile && timestamp) {
      const targetDate = new Date(timestamp)
      const targetDateStr = targetDate.toISOString().split("T")[0].replace(/-/g, "") 

      matchedFile = userFiles.find((file) => file.includes(targetDateStr))
      if (matchedFile) {
        matchReason = "timestamp_match"
      }
    }

    if (!matchedFile && poi_name && poi_name !== "-") {
      const cleanPOI = poi_name.toLowerCase().replace(/[^a-z0-9]/g, "")
      matchedFile = userFiles.find((file) => {
        const cleanFile = file.toLowerCase().replace(/[^a-z0-9]/g, "")
        return cleanFile.includes(cleanPOI) || cleanPOI.includes(cleanFile.split("_")[1] || "")
      })
      if (matchedFile) {
        matchReason = "poi_name_match"
      }
    }

    if (!matchedFile) {
      const filesWithStats = userFiles.map((file) => {
        const filePath = path.join(botPhotosPath, file)
        const stats = fs.statSync(filePath)
        return { file, mtime: stats.mtime }
      })

      filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
      matchedFile = filesWithStats[0]?.file
      matchReason = "latest_file_fallback"
    }

    if (!matchedFile) {
      return res.status(404).json({
        message: "No suitable photo found",
        telegram_id,
        searchCriteria: { poi_name, timestamp, photo_filename },
        availableFiles: userFiles,
      })
    }

    console.log("Photo matched:", matchedFile, "Reason:", matchReason)

    res.json({
      filename: matchedFile,
      url: `/api/photo/${matchedFile}`,
      fullUrl: `http://localhost:5000/api/photo/${matchedFile}`,
      matchReason,
      searchCriteria: { telegram_id, poi_name, timestamp, photo_filename },
    })
  } catch (error) {
    console.error("Error matching photo:", error)
    res.status(500).json({ message: "Error matching photo", error: error.message })
  }
})

// Route untuk debug - list semua file di folder photos
router.get("/debug/list-all-photos", (req, res) => {
  try {
    const botPhotosPath = "D:\\111111KP\\TUGAS_MAGANG\\SalesTeleBot_Mongo\\photos"

    console.log("Debug: Listing all files in photos directory")

    if (!fs.existsSync(botPhotosPath)) {
      return res.status(404).json({ message: "Photos directory not found", path: botPhotosPath })
    }

    const files = fs.readdirSync(botPhotosPath)
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"]

    const photoFiles = files.filter((file) => allowedExtensions.includes(path.extname(file).toLowerCase()))

    // Group by telegram_id
    const groupedFiles = {}
    photoFiles.forEach((file) => {
      const telegramId = file.split("_")[0]
      if (!groupedFiles[telegramId]) {
        groupedFiles[telegramId] = []
      }
      groupedFiles[telegramId].push({
        filename: file,
        url: `/api/photo/${file}`,
        fullUrl: `http://localhost:5000/api/photo/${file}`,
      })
    })

    res.json({
      directory: botPhotosPath,
      totalFiles: files.length,
      photoFiles: photoFiles.length,
      groupedByTelegramId: groupedFiles,
      allFiles: photoFiles.map((file) => ({
        filename: file,
        url: `/api/photo/${file}`,
        fullUrl: `http://localhost:5000/api/photo/${file}`,
      })),
    })
  } catch (error) {
    console.error("Error listing all photos:", error)
    res.status(500).json({ message: "Error listing photos", error: error.message })
  }
})

module.exports = router
