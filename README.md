# 🛒 Easy Deals LMG — Enterprise Second-Hand Marketplace

> **Assam's most trusted platform for buying and selling second-hand products.**
> Built with Next.js 15, Firebase, TypeScript, and Tailwind CSS.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Security](#security)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Deployment](#deployment)

---

## 🌟 Overview

Easy Deals LMG is a production-ready, full-stack marketplace platform connecting
regional buyers and sellers for second-hand products across Silchar, Guwahati,
Cachar, and Assam. The platform acts as a trusted middleman and earns commission
from both buyers and sellers.

**Target Market:** Silchar, Guwahati, Cachar, Assam, India

**SEO Keywords:**
- "sell used phone in Silchar"
- "second hand buyer in Assam"
- "used laptop buyer in Guwahati"

---

## 🧰 Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | Next.js 15 (App Router), TypeScript             |
| Styling      | Tailwind CSS, Framer Motion                     |
| State        | Zustand, TanStack React Query                   |
| Backend      | Firebase Functions (Node.js 20)                 |
| Database     | Firebase Firestore                              |
| Auth         | Firebase Authentication (Google + Phone OTP)    |
| Storage      | Firebase Storage                                |
| Validation   | Zod, DOMPurify                                  |
| Forms        | React Hook Form + Zod Resolver                  |
| Charts       | Recharts                                        |
| Images       | Next.js Image, browser-image-compression        |

---

## 🏗️ Architecture

```
Browser (Next.js SSR/SSG/ISR)
    │
    ├── Public Pages (SSG + ISR)
    │     Home, Products, Categories, About, FAQ
    │
    ├── Protected Pages (Server-side auth check)
    │     Sell, Profile, Bookings, Wishlist
    │
    ├── Admin Panel (Server-side role check)
    │     Dashboard, Listings, Users, Reports, Analytics
    │
    ├── API Routes (Server-side, rate-limited)
    │     /api/auth/session   — Create HTTP-only session cookie
    │     /api/auth/logout    — Destroy session cookie
    │     /api/products       — Product CRUD
    │     /api/contact        — Contact form
    │     /api/admin/*        — Admin operations (role-verified)
    │
    └── Firebase Services
          Firestore   — Database (security rules enforced)
          Storage     — Image hosting (security rules enforced)
          Functions   — Cloud triggers + scheduled jobs
          Auth        — Google + Phone OTP login
```

---

## ✨ Features

### For Buyers
- Browse and search listings with advanced filters
- WhatsApp direct contact with sellers
- Wishlist / saved products
- Booking / inquiry system
- Notifications for booking updates
- Verified seller badges

### For Sellers
- Multi-step product listing with image upload
- Auto image compression
- Draft save functionality
- Real-time validation
- Listing approval workflow
- Booking management (accept/reject/complete)

### For Admins
- Full dashboard with analytics and charts
- Pending approval queue
- User management (ban/suspend/verify)
- Report management
- Notification broadcasting
- Admin audit logs

### Platform
- Google & Phone OTP authentication
- Firebase session cookies (HTTP-only, secure)
- Role-based access control (admin/seller/buyer)
- Rate limiting on all API endpoints
- Firestore security rules
- Storage security rules
- Dynamic sitemap.xml
- robots.txt
- Open Graph + Twitter cards
- Schema.org structured data
- ISR (Incremental Static Regeneration)
- PWA-ready
- WhatsApp floating button integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Firebase project (Blaze plan for Functions)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/easy-deals-lmg.git
cd easy-deals-lmg
```

### 2. Install dependencies
```bash
npm install
cd functions && npm install && cd ..
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your Firebase config
```

### 4. Set up Firebase
```bash
npm install -g firebase-tools
firebase login
firebase use your-project-id
```

### 5. Deploy Firestore rules and indexes
```bash
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only storage
```

### 6. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Run Firebase emulators (optional)
```bash
firebase emulators:start
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Firebase Client (public, safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (secret — server only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# App
NEXT_PUBLIC_APP_URL=https://easydealslmg.com
NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER=+919876543210
SESSION_SECRET=your-32-char-minimum-secret-key
SESSION_COOKIE_NAME=easy_deals_session
```

---

## 📁 Project Structure

See **File Structure** section below for the complete directory tree.

---

## 🔒 Security

| Feature                     | Implementation                                    |
|-----------------------------|---------------------------------------------------|
| Authentication              | Firebase Auth + HTTP-only session cookies         |
| Authorization               | RBAC via Firestore + middleware                   |
| Rate Limiting               | In-middleware (production: use Redis/Upstash)     |
| Input Validation            | Zod schemas on every form + API route             |
| XSS Prevention              | DOMPurify + CSP headers + input sanitization      |
| CSRF Protection             | SameSite cookies + CORS allowlist                 |
| SQL/NoSQL Injection          | Firestore security rules + parameterized queries  |
| File Upload Security        | MIME type validation + size limits + compression  |
| Security Headers            | CSP, HSTS, X-Frame-Options, etc. (next.config.js)|
| Firestore Rules             | Per-collection rules with ownership checks        |
| Storage Rules               | File type + size + path validation                |
| Admin Routes                | Server-side role verification on every request    |
| Audit Logging               | Admin actions logged to Firestore adminLogs       |
| Sensitive Data              | Never exposed — env vars only                     |

---

## 🗄️ Database Schema

### Collections

```
users/{uid}
  ├── uid, email, displayName, photoURL, phoneNumber
  ├── role: 'buyer' | 'seller' | 'admin'
  ├── status: 'active' | 'suspended' | 'banned'
  ├── isEmailVerified, isPhoneVerified, isVerifiedSeller
  ├── totalListings, totalSales, totalPurchases
  ├── rating, ratingCount
  └── createdAt, updatedAt, lastLoginAt

products/{productId}
  ├── title, slug, description, category, condition
  ├── price, negotiable, images[], location, city
  ├── sellerId, sellerName, sellerWhatsapp, isVerifiedSeller
  ├── status: 'pending'|'active'|'sold'|'rejected'|'removed'|'draft'
  ├── views, wishlistCount, reportCount, tags[]
  └── createdAt, updatedAt, expiresAt

bookings/{bookingId}
  ├── productId, productTitle, productPrice, productImage
  ├── sellerId, sellerName, buyerId, buyerName
  ├── buyerPhone, buyerWhatsapp, message, offeredPrice
  ├── status: 'pending'|'accepted'|'rejected'|'completed'|'cancelled'
  └── createdAt, updatedAt

reviews/{reviewId}
  ├── sellerId, reviewerId, reviewerName, productId
  ├── rating (1-5), comment, isVerifiedPurchase
  └── createdAt

reports/{reportId}
  ├── productId, productTitle, reporterId
  ├── type, description, status, adminNote
  └── createdAt, resolvedAt

notifications/{notifId}
  ├── userId, type, title, body, link
  ├── isRead
  └── createdAt

transactions/{txId}
  ├── bookingId, productId, userId, type, amount
  ├── status, razorpayOrderId, razorpayPaymentId
  └── createdAt

adminLogs/{logId}
  ├── adminId, adminEmail, action, targetType, targetId
  ├── description, metadata
  └── createdAt

contactMessages/{msgId}
  ├── name, email, phone, subject, message
  ├── status: 'unread' | 'read' | 'resolved'
  └── createdAt
```

---

## 🛣️ API Routes

| Method | Route                        | Auth     | Description                  |
|--------|------------------------------|----------|------------------------------|
| POST   | /api/auth/session            | —        | Create session cookie        |
| POST   | /api/auth/logout             | —        | Destroy session cookie       |
| GET    | /api/products                | —        | List active products         |
| POST   | /api/products                | User     | Create product listing       |
| PATCH  | /api/admin/products          | Admin    | Approve/reject/remove        |
| GET    | /api/admin/products          | Admin    | Get all products (any status)|
| PATCH  | /api/admin/users             | Admin    | Ban/suspend/verify user      |
| PATCH  | /api/admin/reports           | Admin    | Resolve/dismiss report       |
| POST   | /api/admin/notifications     | Admin    | Broadcast notification       |
| POST   | /api/contact                 | —        | Contact form submission      |

---

## 🌐 Deployment

### Next.js (Vercel recommended)
```bash
# Set all environment variables in Vercel dashboard
vercel --prod
```

### Firebase Functions
```bash
cd functions
npm run build
firebase deploy --only functions
```

### Full Firebase Deploy
```bash
firebase deploy
```

---

## 📊 Performance

- **Core Web Vitals:** Optimized with SSR, ISR, and image optimization
- **LCP:** < 2.5s (Next.js Image + CDN)
- **FID:** < 100ms (minimal JavaScript on initial load)
- **CLS:** < 0.1 (stable layouts, no layout shift)
- **Bundle:** Code splitting + dynamic imports
- **Caching:** React Query + ISR + CDN headers

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feat/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open Pull Request

---

## 📄 License

MIT License — © 2024 Easy Deals LMG

---

*Built with ❤️ for Assam*