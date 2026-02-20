/**
 * Order Model - MAIVÉ Luxury E-commerce
 * 
 * Features:
 * - Complete order lifecycle management
 * - Payment tracking (CIB, Edahabia, Stripe, Cash on Delivery)
 * - Order status workflow
 * - Shipping tracking
 * - Customer communication
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    colorName: String,
    hexCode: String,
    sku: String
  },
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  image: String
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: String,
  country: {
    type: String,
    default: 'Algeria'
  },
  wilaya: {
    type: String,
    required: true
  }
});

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['cib', 'edahabia', 'stripe', 'cash_on_delivery', 'bank_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  paidAt: Date,
  amount: Number,
  currency: {
    type: String,
    default: 'DZD'
  }
});

const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer Info
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow guest checkout
  },
  customerInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  
  // Order Items
  items: [orderItemSchema],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  discount: {
    code: String,
    amount: { type: Number, default: 0 }
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  
  // Shipping
  shippingAddress: shippingAddressSchema,
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'same_day'],
    default: 'standard'
  },
  trackingNumber: String,
  
  // Payment
  payment: paymentSchema,
  
  // Order Status Workflow
  status: {
    type: String,
    enum: [
      'pending',           // Order placed, awaiting payment
      'payment_received',  // Payment confirmed
      'processing',        // Preparing order
      'shipped',          // Order shipped
      'out_for_delivery', // Out for delivery
      'delivered',        // Successfully delivered
      'cancelled',        // Order cancelled
      'refunded',         // Order refunded
      'returned'          // Items returned
    ],
    default: 'pending'
  },
  
  // Status History
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notes
  customerNote: String,
  adminNote: String,
  
  // Gift Options
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: String,
  giftWrap: {
    type: Boolean,
    default: false
  },
  
  // Communication
  emailNotifications: [{
    type: String,
    sentAt: Date
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: Date
});

// Indexes
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });

// Pre-save middleware
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Add status history entry if status changed
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      updatedAt: new Date()
    });
  }
  
  next();
});

// Methods
orderSchema.methods.canCancel = function() {
  return ['pending', 'payment_received'].includes(this.status);
};

orderSchema.methods.canRefund = function() {
  return ['delivered', 'shipped'].includes(this.status);
};

orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    note,
    updatedBy,
    updatedAt: new Date()
  });
  
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  }
  
  return this.save();
};

// Static methods
orderSchema.statics.generateOrderNumber = async function() {
  const date = new Date();
  const prefix = 'MAV';
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Get count of orders today
  const today = new Date(date.setHours(0, 0, 0, 0));
  const count = await this.countDocuments({ createdAt: { $gte: today } });
  
  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}${year}${month}${day}${sequence}`;
};

orderSchema.statics.getSalesStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $nin: ['cancelled', 'returned'] }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
