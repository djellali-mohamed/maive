const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort = '-createdAt' } = req.query;
    const query = { role: 'customer' };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    const customers = await User.find(query).select('-password').sort(sort).limit(limit * 1).skip((page - 1) * limit);
    const count = await User.countDocuments(query);
    res.json({ success: true, data: { customers, pagination: { page: Number(page), pages: Math.ceil(count / limit), total: count, limit: Number(limit) } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching customers' });
  }
});

router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(20);
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    res.json({ success: true, data: { customer, orders, stats: { totalOrders: orders.length, totalSpent } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching customer' });
  }
});

router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const customer = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer status updated', data: { customer } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating customer status' });
  }
});

module.exports = router;
