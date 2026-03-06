/**
 * Upload Routes - Cloudinary Integration
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { authenticate, requireAdmin } = require('../middleware/auth');

const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== 'your-api-key' &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_SECRET !== 'your-api-secret';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Select Storage
let storage;
if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'maive/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4'],
      transformation: [{ quality: 'auto:good' }]
    }
  });
} else {
  console.log('⚠️ Cloudinary not configured. Falling back to DiskStorage.');
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video support
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WebP, and MP4 are allowed.'), false);
    }
  }
});

// Upload single image
router.post('/image', authenticate, requireAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
    } else if (err) {
      console.error('Upload Error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      console.log('Upload attempt with no file');
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }
    
    console.log('File received:', req.file.filename, req.file.mimetype);
    
    const baseUrl = process.env.BACKEND_URL || (req.protocol + '://' + req.get('host'));
    const url = isCloudinaryConfigured ? req.file.path : `${baseUrl}/uploads/${req.file.filename}`;
    
    console.log('Upload success. URL:', url);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: url,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Detailed Upload Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// Upload multiple images
router.post('/images', authenticate, requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }
    
    const uploadedImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      size: file.size
    }));
    
    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      data: { images: uploadedImages }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading images'
    });
  }
});

// List all media (Media Library)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    if (isCloudinaryConfigured) {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'maive/',
        max_results: 100
      });
      return res.json({
        success: true,
        data: result.resources.map(r => ({
          url: r.secure_url,
          filename: r.public_id,
          size: r.bytes,
          created_at: r.created_at
        }))
      });
    } else {
      if (!fs.existsSync(uploadDir)) {
        return res.json({ success: true, data: [] });
      }
      
      const files = fs.readdirSync(uploadDir);
      const baseUrl = process.env.BACKEND_URL || (req.protocol + '://' + req.get('host'));
      const media = files.filter(f => !f.startsWith('.')).map(file => {
        try {
          const stats = fs.statSync(path.join(uploadDir, file));
          if (!stats.isFile()) return null;
          return {
            url: `${baseUrl}/uploads/${file}`,
            filename: file,
            size: stats.size,
            created_at: stats.birthtime
          };
        } catch (e) { return null; }
      }).filter(m => m !== null).sort((a,b) => b.created_at - a.created_at);
      
      res.json({
        success: true,
        data: media
      });
    }
  } catch (error) {
    console.error('Media fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching media library',
      error: error.message
    });
  }
});

// Delete image
router.delete('/:filename', authenticate, requireAdmin, async (req, res) => {
  try {
    if (isCloudinaryConfigured) {
      await cloudinary.uploader.destroy(req.params.filename);
    } else {
      const filePath = path.join(uploadDir, req.params.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting file' });
  }
});

module.exports = router;
