# MAIVÉ Platform - Developer Documentation

## 🏗️ Architecture Overview

```
maive-platform/
├── backend/           # Node.js/Express API
├── frontend/          # Customer-facing website
├── admin-panel/       # React Admin Dashboard
└── docs/             # Documentation
```

---

## 📋 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Image Storage**: Cloudinary
- **Payment**: Stripe + CIB/Edahabia (Algeria)

### Frontend
- **HTML5** with GSAP animations
- **CSS3** with custom properties
- **Vanilla JavaScript** (ES6+)
- **Lenis** for smooth scrolling

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Seed database
npm run seed

# Start development server
npm run dev
```

### 2. Environment Variables

```bash
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/maive

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe (for international payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Algeria Payment APIs
CIB_MERCHANT_ID=...
EDAHABIA_MERCHANT_ID=...
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new customer
POST   /api/auth/login             # Login
GET    /api/auth/me                # Get current user
PUT    /api/auth/profile           # Update profile
PUT    /api/auth/password          # Change password
```

### Products
```
GET    /api/products               # List products (public)
GET    /api/products/featured      # Featured products
GET    /api/products/new-arrivals  # New arrivals
GET    /api/products/slug/:slug    # Get product by slug
GET    /api/products/:id           # Get product by ID
POST   /api/products               # Create product (admin)
PUT    /api/products/:id           # Update product (admin)
DELETE /api/products/:id           # Delete product (admin)
PATCH  /api/products/:id/stock     # Update stock (admin)
```

### Cart
```
GET    /api/cart                   # Get cart
POST   /api/cart/add               # Add item
PUT    /api/cart/update            # Update quantity
DELETE /api/cart/remove            # Remove item
DELETE /api/cart/clear             # Clear cart
POST   /api/cart/coupon            # Apply coupon
DELETE /api/cart/coupon            # Remove coupon
```

### Orders
```
POST   /api/orders/checkout        # Create order
GET    /api/orders/my-orders       # Get user orders
GET    /api/orders/track/:number   # Track order (guest)
GET    /api/orders/:id             # Get order details
POST   /api/orders/:id/cancel      # Cancel order
GET    /api/orders                 # List all orders (admin)
PATCH  /api/orders/:id/status      # Update status (admin)
```

### Categories
```
GET    /api/categories             # List categories
GET    /api/categories/slug/:slug  # Get category
POST   /api/categories             # Create (admin)
PUT    /api/categories/:id         # Update (admin)
DELETE /api/categories/:id         # Delete (admin)
```

### Admin
```
GET    /api/admin/users            # List users
POST   /api/admin/users            # Create admin
PUT    /api/admin/users/:id        # Update user
DELETE /api/admin/users/:id        # Delete user
```

### Dashboard
```
GET    /api/dashboard/stats        # Dashboard statistics
GET    /api/dashboard/sales-chart  # Sales chart data
GET    /api/dashboard/top-products # Top selling products
```

### Upload
```
POST   /api/upload/image           # Upload single image
POST   /api/upload/images          # Upload multiple images
DELETE /api/upload/image/:id       # Delete image
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: ['customer', 'admin', 'superadmin'],
  addresses: [Address],
  wishlist: [ProductRef],
  emailPreferences: Object
}
```

### Product Model
```javascript
{
  name: String,
  slug: String (unique),
  description: String,
  basePrice: Number,
  salePrice: Number,
  category: CategoryRef,
  material: String,
  dimensions: Object,
  variants: [{
    name: String,
    hexCode: String,
    images: Object,
    stock: Number,
    sku: String
  }],
  status: ['draft', 'active', 'out_of_stock', 'discontinued'],
  isFeatured: Boolean,
  isNewArrival: Boolean
}
```

### Order Model
```javascript
{
  orderNumber: String (unique),
  customer: UserRef,
  items: [OrderItem],
  subtotal: Number,
  shippingCost: Number,
  total: Number,
  shippingAddress: Object,
  payment: {
    method: ['cib', 'edahabia', 'stripe', 'cash_on_delivery'],
    status: ['pending', 'completed', 'failed', 'refunded']
  },
  status: ['pending', 'payment_received', 'processing', 'shipped', 'delivered', 'cancelled']
}
```

---

## 🔐 Authentication

### JWT Token Flow
1. User logs in with email/password
2. Server validates credentials
3. Server generates JWT token
4. Client stores token (localStorage)
5. Client sends token in Authorization header

### Protected Routes
```javascript
// Middleware usage
const { authenticate, requireAdmin } = require('./middleware/auth');

router.get('/protected', authenticate, handler);
router.get('/admin-only', authenticate, requireAdmin, handler);
```

---

## 🖼️ Image Upload

### Cloudinary Configuration
Images are uploaded to Cloudinary with:
- Folder: `maive/products`
- Auto-optimization enabled
- Max file size: 5MB
- Allowed formats: JPG, PNG, WebP

### Upload Flow
1. Client selects image
2. Image sent to `/api/upload/image`
3. Server uploads to Cloudinary
4. Cloudinary returns URL
5. URL stored in product document

---

## 💳 Payment Integration

### Algeria Payments (CIB/Edahabia)
```javascript
// Integration with local payment providers
// Contact: CIB Algeria, Edahabia
// Required: Merchant account, API credentials
```

### Stripe (International)
```javascript
// Stripe checkout session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: cartItems,
  success_url: `${FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${FRONTEND_URL}/cart`
});
```

### Cash on Delivery
- Order created with status: `pending`
- Payment status: `pending`
- Admin confirms upon delivery

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Manual Testing Checklist
- [ ] User registration/login
- [ ] Product CRUD operations
- [ ] Cart functionality
- [ ] Checkout flow
- [ ] Order status updates
- [ ] Image upload
- [ ] Payment processing

---

## 🚀 Deployment

### Requirements
- Node.js 18+
- MongoDB 5.0+
- Cloudinary account
- Domain & SSL certificate

### Production Checklist
1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Enable Helmet security headers
4. Configure CORS properly
5. Set up MongoDB Atlas
6. Configure Cloudinary
7. Set up Stripe webhooks
8. Enable rate limiting

### Deploy to Vercel/Railway/Render
```bash
# Build command
npm install && npm run seed

# Start command
npm start
```

---

## 📱 WhatsApp Integration

### Order Notifications
```javascript
// Send order confirmation via WhatsApp
const message = `
👜 Nouvelle Commande MAIVÉ

Commande: ${order.orderNumber}
Client: ${order.customerInfo.firstName}
Total: DZD ${order.total}

Produits:
${order.items.map(i => `- ${i.name}`).join('\n')}
`;

// Use Twilio or direct WhatsApp Business API
```

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Solution: Check MONGODB_URI, whitelist IP in Atlas
```

**Image Upload Fails**
```
Solution: Verify Cloudinary credentials, check file size
```

**CORS Errors**
```
Solution: Update FRONTEND_URL in .env
```

**JWT Expired**
```
Solution: User needs to login again
```

---

## 📚 Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Stripe Docs](https://stripe.com/docs)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

*MAIVÉ Platform v2.0.0 - Developer Guide*
