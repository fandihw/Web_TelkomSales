const express = require('express')
const router = express.Router()
const { auth, authorize } = require('../middleware/auth')
const { getMyVisits, getAllVisits } = require('../controllers/dashboardController')

router.get('/my-data', auth, authorize('sales'), getMyVisits)
router.get('/all-data', auth, authorize('admin', 'superadmin'), getAllVisits)

module.exports = router