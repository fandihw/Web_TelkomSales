const Visit = require('../models/Visit')

exports.getMyVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ userId: req.user._id })
    res.json(visits)
  } catch (err) {
    res.status(500).json({ message: 'Error getting visits' })
  }
}

exports.getAllVisits = async (req, res) => {
  try {
    const visits = await Visit.find().populate('userId', 'name email')
    res.json(visits)
  } catch (err) {
    res.status(500).json({ message: 'Error getting all visits' })
  }
}