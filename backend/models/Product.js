/**
 * Product Model - MAIVÉ Luxury Handbags
 * 
 * Features:
 * - Multi-image support (bag + model photos)
 * - Color variants with stock tracking
 * - Category management
 * - SEO-friendly slugs
 * - Inventory management
 * - Luxury product attributes
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const colorVariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  hexCode: {
    type: String,
    required: true,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  images: {
    bagImage: { type: String, required: true },
    modelImage: { type: String, required: true },
    detailImages: [{ type: String }]
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  
  // Pricing
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    min: 0,
    default: null
  },
  currency: {
    type: String,
    default: 'DZD'
  },
  
  // Categorization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Material & Craftsmanship
  material: {
    type: String,
    required: true,
    trim: true
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm' }
  },
  weight: {
    value: Number,
    unit: { type: String, default: 'kg' }
  },
  
  // Color Variants
  variants: [colorVariantSchema],
  
  // Inventory
  totalStock: {
    type: Number,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'out_of_stock', 'discontinued'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  
  // SEO
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  salesCount: {
    type: Number,
    default: 0
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
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ isNewArrival: 1, status: 1 });
productSchema.index({ createdAt: -1 });

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Generate slug
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  
  // Calculate total stock
  this.totalStock = this.variants.reduce((sum, variant) => sum + variant.stock, 0);
  
  // Update status based on stock
  if (this.totalStock === 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  } else if (this.totalStock > 0 && this.status === 'out_of_stock') {
    this.status = 'active';
  }
  
  this.updatedAt = Date.now();
  next();
});

// Methods
productSchema.methods.getDefaultVariant = function() {
  return this.variants.find(v => v.isAvailable) || this.variants[0];
};

productSchema.methods.isInStock = function() {
  return this.totalStock > 0;
};

productSchema.methods.getPrice = function() {
  return this.salePrice || this.basePrice;
};

// Static methods
productSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug }).populate('category');
};

productSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, status: 'active' }).populate('category');
};

productSchema.statics.findNewArrivals = function(limit = 8) {
  return this.find({ isNewArrival: true, status: 'active' })
    .populate('category')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Product', productSchema);
