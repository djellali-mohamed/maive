/**
 * Order Routes
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Create order (checkout)
router.post('/checkout', optionalAuth, async (req, res) => {
  try {
    const {
      cartId,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      customerInfo,
      isGift,
      giftMessage,
      giftWrap
    } = req.body;
    
    let cartItems = [];
    let calculatedSubtotal = 0;

    // Get cart
    if (req.user) {
      const dbCart = await Cart.findOne({ user: req.user._id });
      if (dbCart && dbCart.items.length > 0) {
        cartItems = dbCart.items;
        calculatedSubtotal = dbCart.subtotal;
      }
    } else if (cartId) {
      const dbCart = await Cart.findOne({ sessionId: cartId });
      if (dbCart && dbCart.items.length > 0) {
        cartItems = dbCart.items;
        calculatedSubtotal = dbCart.subtotal;
      }
    }
    
    // Fallback for direct Guest Checkout bypass
    if (cartItems.length === 0 && req.body.items && req.body.items.length > 0) {
        cartItems = req.body.items;
        calculatedSubtotal = req.body.subtotal || cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    
    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Validate stock
    for (const item of cartItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.name}`
        });
      }

      const variant = product.variants.find(v => v.sku === item.variant.sku || v.name === item.variant.colorName);
      
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} - ${variant?.name || item.variant.colorName}`
        });
      }
    }
    
    // Calculate totals
    const subtotal = calculatedSubtotal;
    const shippingCost = shippingMethod === 'express' ? 1500 : shippingMethod === 'same_day' ? 3000 : 800;
    
    // Check if real cart exists for discount, else 0
    let discountAmount = 0;
    let couponCode = null;
    let dbCart = null;
    if (req.user) {
        dbCart = await Cart.findOne({ user: req.user._id });
    } else if (cartId) {
        dbCart = await Cart.findOne({ sessionId: cartId });
    }
    
    if (dbCart) {
        discountAmount = dbCart.discountAmount || 0;
        if (dbCart.coupon) couponCode = dbCart.coupon.code;
    }
    
    const total = subtotal + shippingCost - discountAmount;
    
    // Generate order number
    const orderNumber = await Order.generateOrderNumber();
    
    // Create order items
    const orderItems = await Promise.all(cartItems.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) return null;
      const variant = product.variants.find(v => v.sku === item.variant.sku || v.name === item.variant.colorName);
      return {
        product: item.product,
        variant: item.variant,
        name: product.name,
        quantity: item.quantity,
        price: item.price,
        image: variant?.images?.bagImage || item.image || ''
      };
    }));
    
    // Filter out any null items
    const validOrderItems = orderItems.filter(i => i !== null);
    
    // Create order
    const order = new Order({
      orderNumber,
      customer: req.user?._id || null,
      customerInfo: req.user ? {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone
      } : customerInfo,
      items: validOrderItems,
      subtotal,
      shippingCost,
      discount: couponCode ? {
        code: couponCode,
        amount: discountAmount
      } : null,
      total,
      shippingAddress,
      shippingMethod,
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
        amount: total,
        currency: 'DZD'
      },
      isGift,
      giftMessage,
      giftWrap,
      status: 'pending'
    });
    
    await order.save();
    
    // Update stock
    for (const item of cartItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const variant = product.variants.find(v => v.sku === item.variant.sku || v.name === item.variant.colorName);
        if (variant) {
           variant.stock -= item.quantity;
           await product.save();
        }
      }
    }
    
    // Clear cart if one exists
    if (dbCart) {
      await dbCart.clear();
    }
    
    // TODO: Send order confirmation email
    // TODO: Send WhatsApp notification
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: `Error processing order: ${error.message}`,
      stack: error.stack
    });
  }
});

// Get user orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'name slug')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Get order by number (for guests with email verification)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { email } = req.query;
    
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Verify email for security
    if (order.customerInfo.email.toLowerCase() !== email?.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Invalid email for this order'
      });
    }
    
    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error tracking order'
    });
  }
});

// Get single order (authenticated)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      $or: [
        { customer: req.user._id },
        { 'customerInfo.email': req.user.email }
      ]
    }).populate('items.product', 'name slug variants');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// Cancel order (customer)
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (!order.canCancel()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }
    
    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      const variant = product.variants.find(v => v.sku === item.variant.sku);
      if (variant) {
        variant.stock += item.quantity;
        await product.save();
      }
    }
    
    await order.updateStatus('cancelled', 'Cancelled by customer', req.user._id);
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling order'
    });
  }
});

// ========== ADMIN ROUTES ==========

// Get all orders (admin)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      search
    } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Order.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        orders,
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
      message: 'Error fetching orders'
    });
  }
});

// Update order status (admin)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const { status, note, trackingNumber } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    await order.updateStatus(status, note, req.user._id);
    
    // TODO: Send status update email to customer
    
    res.json({
      success: true,
      message: 'Order status updated',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

module.exports = router;
