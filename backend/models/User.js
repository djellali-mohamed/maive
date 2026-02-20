/**
 * User Model - MAIVÉ Platform
 * 
 * Features:
 * - Role-based access (customer, admin, superadmin)
 * - Secure password hashing
 * - JWT token management
 * - Customer profiles with wishlist
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phone: String,
  address: String,
  city: String,
  wilaya: String,
  postalCode: String,
  country: { type: String, default: 'Algeria' },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  // Basic Info
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  
  // Authentication
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['customer', 'admin', 'superadmin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Profile
  avatar: String,
  dateOfBirth: Date,
  
  // Addresses
  addresses: [addressSchema],
  
  // Wishlist
  wishlist: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Order History
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  
  // Statistics
  totalSpent: {
    type: Number,
    default: 0
  },
  orderCount: {
    type: Number,
    default: 0
  },
  
  // Email Preferences
  emailPreferences: {
    newsletter: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true }
  },
  
  // Password Reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Last Login
  lastLogin: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Pre-save middleware - Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

userSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

userSchema.methods.isInWishlist = function(productId) {
  return this.wishlist.some(item => item.product.toString() === productId.toString());
};

userSchema.methods.addToWishlist = function(productId) {
  if (!this.isInWishlist(productId)) {
    this.wishlist.push({ product: productId });
  }
  return this.save();
};

userSchema.methods.removeFromWishlist = function(productId) {
  this.wishlist = this.wishlist.filter(
    item => item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema);
