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
