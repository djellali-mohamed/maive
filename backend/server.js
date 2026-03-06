/**
 * MAIVÉ Luxury E-commerce Platform - Backend Server
 * Production-ready Node.js/Express API
 * 
 * Features:
 * - JWT Authentication & Authorization
 * - Product Management (CRUD)
 * - Order Processing
 * - Image Upload (Cloudinary)
 * - Payment Integration (Stripe + CIB/Edahabia)
 * - Admin Panel API
 * - Security (Helmet, Rate Limiting, CORS)
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customers');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const lookbookRoutes = require('./routes/lookbooks');

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      connectSrc: ["'self'", "https:", "http://localhost:5000", "https://maive.onrender.com"],
      mediaSrc: ["'self'", "https://video.wixstatic.com", "https:", "blob:"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
app.use(cors({
  origin: [
    "https://maive.onrender.com", 
    "https://maive.vercel.app",
    "http://localhost:5000"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend Static Files (images, CSS, JS, HTML)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maive', {
  })
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/lookbooks', lookbookRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`Status: ${err.status || 500} | Error: ${err.message}`);
  
  // Specific Mongoose Errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Données invalides', errors: err.errors });
  }
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Cette valeur existe déjà dans notre base de données' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Une erreur interne est survenue',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, details: err })
  });
});

// Catch-all: serve frontend index.html for non-API routes
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   👜 MAIVÉ Luxury E-commerce Platform                        ║
║   Backend Server v2.0.0                                      ║
║                                                              ║
║   Server running on port ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                          ║
║                                                              ║
║   API Endpoints:                                             ║
║   • Health:    http://localhost:${PORT}/api/health                    ║
║   • Auth:      http://localhost:${PORT}/api/auth                      ║
║   • Products:  http://localhost:${PORT}/api/products                  ║
║   • Orders:    http://localhost:${PORT}/api/orders                    ║
║   • Admin:     http://localhost:${PORT}/api/admin                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
