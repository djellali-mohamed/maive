/**
 * Category Model - MAIVÉ Platform
 * 
 * Hierarchical category system for luxury handbags
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  
  // Display
  image: String,
  icon: String,
  
  // Position
  order: {
    type: Number,
    default: 0
  },
  
  // Parent category (for subcategories)
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Statistics
  productCount: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Category', categorySchema);
