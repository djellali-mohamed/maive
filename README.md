# 👜 MAIVÉ Luxury E-commerce Platform

> *L'essence de votre renaissance*

A production-ready luxury handbag e-commerce platform built to compete with Prada, Dior, and Chanel.

![Version](https://img.shields.io/badge/version-2.0.0-gold)
![Node](https://img.shields.io/badge/node-18+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

### Customer Experience
- 🎬 **Cinematic video hero** with elegant animations
- 🛍️ **Seamless shopping cart** with quick-add functionality
- 💳 **Multiple payment options** (CIB, Edahabia, Stripe, Cash on Delivery)
- 📱 **WhatsApp integration** for order notifications
- 🔍 **Product filtering** by category
- 🎨 **Color variant selection** with live image switching
- 📦 **Order tracking** for guests and registered users

### Admin Panel
- 📊 **Dashboard** with real-time statistics
- 👜 **Product management** with multi-variant support
- 📦 **Order lifecycle management**
- 👥 **Customer management**
- 🖼️ **Cloudinary image upload**
- 📈 **Sales analytics and reporting**

### Technical
- 🔐 **JWT authentication** with role-based access
- 🗄️ **MongoDB** with Mongoose ODM
- ☁️ **Cloudinary** for image storage
- 💳 **Stripe** for international payments
- 📧 **Email notifications**
- 📱 **Responsive design**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Cloudinary account

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/maive-platform.git
cd maive-platform

# Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run seed
npm run dev

# Backend runs on http://localhost:5000
```

### Default Admin Credentials
```
Email: admin@maive.com
Password: Admin123!
```

---

## 📁 Project Structure

```
maive-platform/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   ├── scripts/         # Seed & utilities
│   ├── server.js        # Entry point
│   └── .env.example     # Environment template
├── frontend/
│   ├── index.html       # Customer website
│   ├── videos/          # Hero & collection videos
│   └── images/          # Posters & assets
├── docs/
│   ├── DEVELOPER_GUIDE.md
│   └── OWNER_MANUAL.md
└── README.md
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Frontend | HTML5, CSS3, Vanilla JS |
| Animations | GSAP, Lenis |
| Images | Cloudinary |
| Payments | Stripe, CIB, Edahabia |
| Auth | JWT |

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login |
| `/auth/register` | POST | User registration |
| `/products` | GET | List products |
| `/products` | POST | Create product (admin) |
| `/orders/checkout` | POST | Create order |
| `/orders` | GET | List orders (admin) |
| `/cart` | GET | Get cart |
| `/cart/add` | POST | Add to cart |
| `/upload/image` | POST | Upload image |

Full documentation in [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)

---

## 🎨 Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Warm Black | `#1a1410` | Text, headers |
| Camel Gold | `#b8986a` | CTAs, accents |
| Warm Beige | `#c9b99a` | Borders, secondary |
| Soft Cream | `#f7f3ee` | Background |

### Typography
- **Titles**: Cormorant Garamond
- **Body**: DM Sans
- **Labels**: DM Mono

---

## 💳 Payment Methods

### Algeria
- **CIB** (Carte Interbancaire)
- **Edahabia** (Algérie Poste)
- **Cash on Delivery**

### International
- **Stripe** (Credit/Debit cards)

---

## 📱 Screenshots

### Customer Website
- Hero video section with elegant woman
- Product grid with hover effects
- Shopping cart sidebar
- Order confirmation

### Admin Dashboard
- Real-time statistics
- Product management
- Order tracking
- Customer insights

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Manual testing checklist
# See DEVELOPER_GUIDE.md
```

---

## 🚀 Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)
```bash
# Deploy frontend
vercel --prod

# Deploy backend
railway up
```

### Option 2: VPS (DigitalOcean, AWS, etc.)
```bash
# Using PM2
pm2 start backend/server.js --name maive-api

# Using Nginx reverse proxy
# See deployment guide
```

---

## 📚 Documentation

- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Technical documentation
- [Owner Manual](docs/OWNER_MANUAL.md) - Business operations guide

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Design inspired by Prada, Dior, and Chanel
- Fonts by Google Fonts
- Icons by Feather Icons

---

## 📞 Support

For support, email support@maive.com or join our WhatsApp channel.

---

<p align="center">
  <strong>MAIVÉ</strong> — L'essence de votre renaissance
</p>
