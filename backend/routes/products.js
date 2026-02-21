/**
 * Product Routes - Public & Admin
 */

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      sort = '-createdAt',
      search,
      minPrice,
      maxPrice,
      status = 'active'
    } = req.query;
    
    const query = {};
    if (status !== 'all') {
      query.status = status;
    }
    
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }
    
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          pages: Math.ceil(count / limit),
          total: count,
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// Get featured products (public)
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.findFeatured();
    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products'
    });
  }
});

// Get new arrivals (public)
router.get('/new-arrivals', async (req, res) => {
  try {
    const limit = req.query.limit || 8;
    const products = await Product.findNewArrivals(Number(limit));
    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching new arrivals'
    });
  }
});

// Get single product by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findBySlug(req.params.slug);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Increment views
    product.views += 1;
    await product.save();
    
    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// Get single product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// ========== ADMIN ROUTES ==========

// Create product (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, basePrice, category, description, material, status, bagImage, modelImage, variants } = req.body;
    
    // Basic validation
    if (!name || !basePrice || !category) {
      return res.status(400).json({ success: false, message: 'Le nom, le prix et la catégorie sont obligatoires.' });
    }

    const productData = {
      name,
      basePrice,
      category,
      description,
      material: material || 'Cuir pleine fleur',
      status: status || 'draft',
      createdBy: req.user._id,
      variants: req.body.variants || []
    };

    // If coming from simple admin form (no variants array)
    if (productData.variants.length === 0 && (bagImage || modelImage)) {
      productData.variants.push({
        name: 'Standard',
        sku: `MAV-${Date.now().toString().slice(-4)}`,
        images: { bagImage, modelImage },
        stock: 0
      });
    }
    
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'La pièce a été ajoutée avec succès à l\'Atelier.',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la pièce'
    });
  }
});

// Update product (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, basePrice, category, description, material, status, variants } = req.body;
    
    const updateData = { 
      name, 
      basePrice, 
      category, 
      description, 
      material: material || 'Cuir pleine fleur', 
      status: status || 'draft',
      updatedAt: Date.now() 
    };

    // Replace variants block entirely if provided from frontend
    if (variants && Array.isArray(variants) && variants.length > 0) {
      updateData.variants = variants;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Pièce mise à jour avec succès.',
      data: { product: updatedProduct }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour'
    });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
});

// Update product stock (admin only)
router.patch('/:id/stock', authenticate, requireAdmin, async (req, res) => {
  try {
    const { variantSku, stock } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const variant = product.variants.find(v => v.sku === variantSku);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }
    
    variant.stock = stock;
    await product.save();
    
    res.json({
      success: true,
      message: 'Stock updated',
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating stock'
    });
  }
});

module.exports = router;
