/**
 * Category Routes
 */

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1 })
      .populate('parent', 'name slug');
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// Get category by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category'
    });
  }
});

// ========== ADMIN ROUTES ==========

// Create category (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created',
      data: { category }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating category'
    });
  }
});

// Update category (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category updated',
      data: { category }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating category'
    });
  }
});

// Delete category (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category'
    });
  }
});

module.exports = router;
