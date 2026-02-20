/**
 * Cart Model - MAIVÉ Platform
 * 
 * Shopping cart with session persistence
 */

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  // User cart (null for guest carts)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Session ID for guest carts
  sessionId: {
    type: String,
    index: true
  },
  
  // Cart Items
  items: [cartItemSchema],
  
  // Applied Coupon
  coupon: {
    code: String,
    discount: Number,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Expiration for guest carts (30 days)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for cart totals
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.virtual('discountAmount').get(function() {
  if (!this.coupon) return 0;
  const subtotal = this.subtotal;
  if (this.coupon.discountType === 'percentage') {
    return (subtotal * this.coupon.discount) / 100;
  }
  return Math.min(this.coupon.discount, subtotal);
});

cartSchema.virtual('total').get(function() {
  return this.subtotal - this.discountAmount;
});

// Methods
cartSchema.methods.addItem = function(product, variant, quantity = 1) {
  const existingItem = this.items.find(
    item => item.product.toString() === product._id.toString() && 
            item.variant.sku === variant.sku
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: product._id,
      variant: {
        colorName: variant.name,
        hexCode: variant.hexCode,
        sku: variant.sku
      },
      quantity,
      price: product.getPrice()
    });
  }
  
  return this.save();
};

cartSchema.methods.removeItem = function(productId, sku) {
  this.items = this.items.filter(
    item => !(item.product.toString() === productId.toString() && item.variant.sku === sku)
  );
  return this.save();
};

cartSchema.methods.updateQuantity = function(productId, sku, quantity) {
  const item = this.items.find(
    item => item.product.toString() === productId.toString() && item.variant.sku === sku
  );
  
  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId, sku);
    }
    item.quantity = quantity;
    return this.save();
  }
  
  return Promise.resolve(this);
};

cartSchema.methods.clear = function() {
  this.items = [];
  this.coupon = null;
  return this.save();
};

cartSchema.methods.applyCoupon = function(code, discount, discountType) {
  this.coupon = { code, discount, discountType };
  return this.save();
};

cartSchema.methods.removeCoupon = function() {
  this.coupon = null;
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
