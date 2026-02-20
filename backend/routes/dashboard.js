/**
 * Dashboard Routes - Analytics & Statistics
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    // Today's stats
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });
    
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          status: { $nin: ['cancelled', 'returned'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    // Monthly stats
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: thisMonth }
    });
    
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth },
          status: { $nin: ['cancelled', 'returned'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    // Total stats
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    
    // Low stock products
    const lowStockProducts = await Product.find({
      'variants.stock': { $lte: 5 },
      status: 'active'
    }).limit(5);
    
    // Recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        today: {
          orders: todayOrders,
          revenue: todayRevenue[0]?.total || 0
        },
        thisMonth: {
          orders: monthlyOrders,
          revenue: monthlyRevenue[0]?.total || 0
        },
        totals: {
          orders: totalOrders,
          products: totalProducts,
          customers: totalCustomers
        },
        lowStockProducts,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
});

// Get sales chart data
router.get('/sales-chart', authenticate, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['cancelled', 'returned'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    const formattedData = salesData.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      revenue: item.revenue,
      orders: item.orders
    }));
    
    res.json({
      success: true,
      data: { chartData: formattedData }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sales chart data'
    });
  }
});

// Get top products
router.get('/top-products', authenticate, requireAdmin, async (req, res) => {
  try {
    const topProducts = await Product.find()
      .sort({ salesCount: -1 })
      .limit(10)
      .select('name slug salesCount views basePrice variants.images.bagImage');
    
    res.json({
      success: true,
      data: { topProducts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top products'
    });
  }
});

module.exports = router;
