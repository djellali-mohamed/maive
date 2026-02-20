const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get current settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});

// Update settings (Admin Only)
router.patch('/', authenticate, requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    
    Object.assign(settings, req.body);
    settings.updatedAt = Date.now();
    
    await settings.save();
    res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating settings' });
  }
});

module.exports = router;
