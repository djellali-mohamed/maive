/**
 * Cart Routes
 */

const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

// Get or create cart
router.get('/', optionalAuth, async (req, res) => {
  try {
    let cart;
    const sessionId = req.headers['x-session-id'];
    
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'name slug variants status');
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId })
        .populate('items.product', 'name slug variants status');
    }
    
    if (!cart) {
      return res.json({
        success: true,
        data: {
          cart: {
            items: [],
            subtotal: 0,
            itemCount: 0,
            total: 0
          }
        }
      });
    }
    
    res.json({
      success: true,
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart'
    });
  }
});

// Add item to cart
router.post('/add', optionalAuth, async (req, res) => {
  try {
    const { productId, variantSku, quantity = 1 } = req.body;
    const sessionId = req.headers['x-session-id'];
    
    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Find variant
    const variant = product.variants.find(v => v.sku === variantSku);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }
    
    // Check stock
    if (variant.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }
    
    // Get or create cart
    let cart;
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = new Cart({ user: req.user._id });
      }
    } else {
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID required for guest cart'
        });
      }
      cart = await Cart.findOne({ sessionId });
      if (!cart) {
        cart = new Cart({ sessionId });
      }
    }
    
    // Add item
    await cart.addItem(product, variant, quantity);
    
    // Populate and return
    await cart.populate('items.product', 'name slug variants');
    
    res.json({
      success: true,
      message: 'Item added to cart',
      data: { cart }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to cart'
    });
  }
});

// Update item quantity
router.put('/update', optionalAuth, async (req, res) => {
  try {
    const { productId, variantSku, quantity } = req.body;
    const sessionId = req.headers['x-session-id'];
    
    let cart;
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    await cart.updateQuantity(productId, variantSku, quantity);
    await cart.populate('items.product', 'name slug variants');
    
    res.json({
      success: true,
      message: 'Cart updated',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating cart'
    });
  }
});

// Remove item from cart
router.delete('/remove', optionalAuth, async (req, res) => {
  try {
    const { productId, variantSku } = req.body;
    const sessionId = req.headers['x-session-id'];
    
    let cart;
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    await cart.removeItem(productId, variantSku);
    await cart.populate('items.product', 'name slug variants');
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing item'
    });
  }
});

// Clear cart
router.delete('/clear', optionalAuth, async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    let cart;
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (cart) {
      await cart.clear();
    }
    
    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cart'
    });
  }
});

// Apply coupon
router.post('/coupon', optionalAuth, async (req, res) => {
  try {
    const { code } = req.body;
    const sessionId = req.headers['x-session-id'];
    
    // TODO: Validate coupon code against database
    // For now, hardcode some demo coupons
    const validCoupons = {
      'MAIVE10': { discount: 10, discountType: 'percentage' },
      'WELCOME20': { discount: 20, discountType: 'percentage' },
      'SAVE5000': { discount: 5000, discountType: 'fixed' }
    };
    
    const coupon = validCoupons[code.toUpperCase()];
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }
    
    let cart;
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    await cart.applyCoupon(code.toUpperCase(), coupon.discount, coupon.discountType);
    await cart.populate('items.product', 'name slug variants');
    
    res.json({
      success: true,
      message: 'Coupon applied',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error applying coupon'
    });
  }
});

// Remove coupon
router.delete('/coupon', optionalAuth, async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    let cart;
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (cart) {
      await cart.removeCoupon();
      await cart.populate('items.product', 'name slug variants');
    }
    
    res.json({
      success: true,
      message: 'Coupon removed',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing coupon'
    });
  }
});

module.exports = router;
