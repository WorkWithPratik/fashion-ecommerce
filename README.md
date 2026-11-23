# 🛍️ Luxe Fashion E-Commerce Platform

A full-stack fashion e-commerce web application with **React (Vite + TailwindCSS)** on the frontend and **Node.js (Express + PostgreSQL / Prisma)** on the backend.

---

## ✨ Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with bcrypt password hashing and Role-Based Access Control (`USER` & `ADMIN`).
- 👗 **Catalog & Fashion Categories**: Filter by category, price range, clothing sizes (XS to XXL), real-time search, sorting, and pagination.
- 🛒 **Cart Management**: Authenticated server-side cart with size/color selections, stock checks, and slide-in quick view.
- 💳 **Razorpay Payment Integration**:
  - Auto order generation (`ORD-YYYYMMDD-XXXXXX`).
  - Pre-fill user data & popup Razorpay Checkout modal.
  - Backend HMAC-SHA256 signature verification.
- 📦 **Order Tracking**: Order history with dynamic color-coded status pills (`PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- 🛠️ **Admin Panel**:
  - Live analytics dashboard (Total Revenue, Orders, Products, Users).
  - **Cloudinary Image Dropper**: Drag-and-drop multiple images directly to Cloudinary CDN with instant preview & removal.
  - Full Product CRUD with instant live image updates.
  - Category manager with slug auto-generation.
  - Order status management & details modal.

---

## 📁 Project Architecture

```
E-Commerce/
├── client/                     # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── api/axios.js        # Axios instance with Bearer token interceptor
│   │   ├── components/         # Navbar, CartSidebar, ImageDropzone, ProductCard...
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── pages/              # Home, Products, ProductDetail, Cart, Checkout, Orders
│   │   └── pages/admin/        # Dashboard, AdminProducts, AdminOrders, AdminCategories
├── server/                     # Node.js + Express + Prisma + PostgreSQL
│   ├── prisma/schema.prisma    # PostgreSQL Schema (Users, Products, Cart, Orders...)
│   ├── src/
│   │   ├── config/             # Cloudinary & Prisma setup
│   │   ├── middleware/         # Auth, AdminAuth, Multer-Cloudinary
│   │   ├── routes/             # Auth, Products, Cart, Orders, Admin
│   │   └── utils/              # Order ID generator
```

---

## 🚀 Quick Setup & Run

### 1. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in `server/`:
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/fashion_ecom"
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN="7d"

# Cloudinary (Get from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Razorpay (Get test keys from razorpay.com dashboard)
RAZORPAY_KEY_ID="rzp_test_xxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"

CLIENT_URL="http://localhost:5173"
```

Sync database schema with PostgreSQL:
```bash
npx prisma db push
```

Start the backend:
```bash
npm run dev
```

---

### 2. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

Visit: `http://localhost:5173`

---

## 🛡️ Creating Admin Account
Register a user from the web interface (`/register`), then update their role to `ADMIN` in PostgreSQL:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```
Or open Prisma Studio:
```bash
cd server
npx prisma studio
```
