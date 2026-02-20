/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate, generateToken } = require('../middleware/auth');

// Register
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { firstName, lastName, email, password, phone } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone
    });
    
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account'
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist.product', 'name slug images basePrice');
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, phone, dateOfBirth } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, dateOfBirth },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Profile updated',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Change password
router.put('/password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});

// Add address
router.post('/addresses', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.push(req.body);
    await user.save();
    
    res.json({
      success: true,
      message: 'Address added',
      data: { addresses: user.addresses }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding address'
    });
  }
});

// Wishlist routes
router.get('/wishlist', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist.product', 'name slug variants basePrice salePrice');
    
    res.json({
      success: true,
      data: { wishlist: user.wishlist }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist'
    });
  }
});

router.post('/wishlist/:productId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await user.addToWishlist(req.params.productId);
    
    res.json({
      success: true,
      message: 'Added to wishlist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding to wishlist'
    });
  }
});

router.delete('/wishlist/:productId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await user.removeFromWishlist(req.params.productId);
    
    res.json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing from wishlist'
    });
  }
});

module.exports = router;
