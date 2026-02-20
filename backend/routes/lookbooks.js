const express = require('express');
const router = express.Router();
const Lookbook = require('../models/Lookbook');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get all active lookbooks
router.get('/', async (req, res) => {
  try {
    const lookbooks = await Lookbook.find({ isActive: true }).sort('order');
    res.json({ success: true, data: lookbooks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching lookbooks' });
  }
});

// Create lookbook (Admin Only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const lookbook = new Lookbook(req.body);
    await lookbook.save();
    res.status(201).json({ success: true, data: lookbook });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating lookbook' });
  }
});

// Delete lookbook (Admin Only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await Lookbook.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lookbook deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting lookbook' });
  }
});

module.exports = router;
