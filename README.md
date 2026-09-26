# Innovexa Project 1 - Women's Fashion E-Commerce Platform

Product Catalog & Backend API built with Node.js, Express, and MongoDB (Mongoose).

## Project Structure

```
Innovexa_project_1/
├── backend/
│   ├── config/
│   │   └── mongodb.js           # Mongoose MongoDB connection
│   ├── controllers/
│   │   └── productController.js # Product CRUD & filtering logic
│   ├── middleware/
│   │   └── auth.js              # JWT authentication & admin guard
│   ├── models/
│   │   └── Product.model.js     # Mongoose Product Schema
│   ├── routes/
│   │   └── productRoutes.js     # REST API routes for products
│   ├── scripts/
│   │   └── seed.js              # Standalone database seeder
│   ├── utils/
│   │   └── seeder.js            # Seeder module export
│   └── server.js                # Express Server entrypoint
├── frontend/                    # Storefront UI
├── .env                         # Environment variables
└── package.json                 # Node dependencies and scripts
```

## Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run MongoDB Database Seeder:**
   ```bash
   npm run seed
   # or: node backend/scripts/seed.js
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   # or: node backend/server.js
   ```

4. **Open in Browser:**
   - Storefront: `http://localhost:5000`
   - Products API: `http://localhost:5000/api/products`
# Innovexa - Women's Fashion Store Backend API

A robust, modular, and scalable RESTful API built for a modern women's fashion e-commerce store using **Node.js**, **Express**, **MongoDB (Mongoose)**, **JWT Authentication**, and **Stripe-ready / Mock Payment Processing**.

---

## 📁 Project Directory Structure

```
Innovexa/
├── .env                  # Local environment configuration (git-ignored)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore specification
├── package.json          # Node.js dependencies & scripts
├── README.md             # Project documentation & API guide
└── backend/
    ├── config/           # Configuration files
    │   └── db.js         # MongoDB connection lifecycle management
    ├── controllers/      # Business logic & request handling
    │   ├── authController.js
    │   ├── cartController.js
    │   ├── orderController.js
    │   ├── paymentController.js
    │   └── productController.js
    ├── middleware/       # Custom Express middleware
    │   ├── authMiddleware.js   # JWT validation & role authorization
    │   └── errorMiddleware.js  # 404 Not Found & centralized error handling
    ├── models/           # Mongoose schemas & data models
    │   ├── Cart.model.js
    │   ├── Order.model.js
    │   ├── Product.model.js
    │   └── User.model.js
    ├── routes/           # Express routing layer
    │   ├── index.js      # Unified API router aggregator (/api)
    │   ├── authRoutes.js
    │   ├── cartRoutes.js
    │   ├── orderRoutes.js
    │   ├── paymentRoutes.js
    │   └── productRoutes.js
    ├── utils/            # Shared helper functions & services
    │   └── generateToken.js
    └── server.js         # Express application entrypoint
```

---

## 🛠️ Tech Stack & Key Packages

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/) (v5)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JSON Web Tokens (jsonwebtoken)](https://jwt.io/)
- **Payments**: Stripe API ready with built-in zero-credential mock flow for local testing
- **Environment Management**: [dotenv](https://github.com/motdotla/dotenv)
- **Live Reload**: [nodemon](https://nodemon.io/)

---

## 🚀 Getting Started

### 1. Installation

Install all required dependencies:
```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your variables:
```bash
# Server Port & Mode
PORT=5000
NODE_ENV=development

# Database Connection
MONGO_URI=mongodb://127.0.0.1:27017/womens_fashion_store

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Stripe (Optional: Leave blank to use built-in mock payment intent mode)
STRIPE_SECRET_KEY=
```

### 3. Run the Server

**Development Mode (with live reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`.

---

## 📡 API Endpoints Reference

All API routes are prefixed with `/api`.

### 1. Health & Server
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Service health status and MongoDB connection state | Public |
| `GET` | `/` | Root welcoming route with directory endpoints | Public |

### 2. Authentication (`/api/auth`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new customer account | Public |
| `POST` | `/api/auth/login` | Log in and receive JWT token | Public |
| `GET` | `/api/auth/dev-token` | Generate a quick development token for testing | Public (Dev) |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | Required |

### 3. Fashion Catalog (`/api/products`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/products` | Browse catalog with category and price filtering | Public |
| `GET` | `/api/products/:id` | View detailed product information | Public |
| `POST` | `/api/products/seed` | Seed demo women's apparel (dresses, tops, skirts) | Public (Dev) |

### 4. Shopping Cart (`/api/cart`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/cart` | View user's cart with populated product data & subtotals | Required |
| `POST` | `/api/cart` | Add product to cart (supports size and color variants) | Required |
| `PUT` | `/api/cart/items/:itemId` | Update quantity of specific cart item | Required |
| `DELETE` | `/api/cart/items/:itemId` | Remove an item from cart | Required |
| `DELETE` | `/api/cart` | Clear entire shopping cart | Required |

### 5. Order Management (`/api/orders`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/orders` | Checkout: Convert active cart into an order | Required |
| `GET` | `/api/orders` | Retrieve paginated order history for current user | Required |
| `GET` | `/api/orders/:id` | View specific order details | Required |
| `PATCH` | `/api/orders/:id/status` | Update fulfillment or payment status | Required |

### 6. Payment Processing (`/api/payments`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/payments/create-intent` | Initialize Stripe / Mock payment intent | Required |
| `POST` | `/api/payments/confirm` | Confirm payment and update order to `completed` | Required |

---

## 🔒 Authentication Header

When calling protected endpoints, pass the JWT token in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```
*(In development, you can generate a test token instantly via `GET /api/auth/dev-token`)*.
