/**
 * Admin Routes - User Management & Settings
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticate, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

// Get all users (admin)
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          pages: Math.ceil(count / limit),
          total: count,
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Create admin user (superadmin only)
router.post('/users', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: role || 'admin'
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
});

// Update user (admin)
router.put('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { firstName, lastName, phone, role, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, phone, role, isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

// Delete user (superadmin only)
router.delete('/users/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// Maintenance: Clear transactional data (superadmin only)
router.post('/maintenance/clear-data', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Cart = require('../models/Cart');
    
    const orderCount = await Order.countDocuments();
    const cartCount = await Cart.countDocuments();
    
    await Order.deleteMany({});
    await Cart.deleteMany({});
    
    res.json({
      success: true,
      message: `Successfully deleted ${orderCount} orders and ${cartCount} carts.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing data'
    });
  }
});

module.exports = router;
