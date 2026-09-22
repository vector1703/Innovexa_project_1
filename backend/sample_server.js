require("dotenv").config({
    path: "./db.env"
});

const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "vegmarket-secret-2026",

        resave: false,

        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 60 * 6
        }
    })
);

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// =====================================================
// MYSQL
// =====================================================

const db = mysql.createPool({

    host: process.env.DB_HOST,

    port: process.env.DB_PORT || 3306,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0
});


// =====================================================
// CUSTOMER AUTH MIDDLEWARE
// =====================================================

function requireCustomerLogin(req, res, next) {

    if (
        req.session &&
        req.session.userId
    ) {
        return next();
    }

    if (
        req.originalUrl.startsWith("/api/")
    ) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    return res.redirect("/login.html");
}


// =====================================================
// ADMIN AUTH MIDDLEWARE
// =====================================================

function requireAdminLogin(req, res, next) {

    if (
        req.session &&
        req.session.isAdmin
    ) {
        return next();
    }

    if (
        req.originalUrl.startsWith("/api/")
    ) {
        return res.status(401).json({
            success: false,
            message: "Admin login required"
        });
    }

    return res.redirect("/admin-login.html");
}


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});


// =====================================================
// CUSTOMER REGISTER
// =====================================================

app.post(
    "/api/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "All fields are required"
                });
            }


            if (password.length < 6) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Password must contain at least 6 characters"
                });
            }


            const [existing] =
                await db.execute(
                    "SELECT id FROM users WHERE email = ?",
                    [email]
                );


            if (existing.length > 0) {

                return res.status(409).json({
                    success: false,
                    message:
                        "Email already registered"
                });
            }


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            const [result] =
                await db.execute(

                    `INSERT INTO users
                    (name, email, password)
                    VALUES (?, ?, ?)`,

                    [
                        name,
                        email,
                        hashedPassword
                    ]
                );


            req.session.userId =
                result.insertId;

            req.session.userName =
                name;


            res.status(201).json({

                success: true,

                message:
                    "Registration successful",

                userId:
                    result.insertId
            });


        } catch (error) {

            console.error(
                "Register error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"
            });
        }
    }
);


// =====================================================
// CUSTOMER LOGIN
// =====================================================

app.post(
    "/api/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and password required"
                });
            }


            const [users] =
                await db.execute(

                    "SELECT * FROM users WHERE email = ?",

                    [email]
                );


            if (users.length === 0) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"
                });
            }


            const user =
                users[0];


            const match =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!match) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"
                });
            }


            req.session.userId =
                user.id;

            req.session.userName =
                user.name;


            res.json({

                success: true,

                message:
                    "Login successful",

                name:
                    user.name
            });


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"
            });
        }
    }
);


// =====================================================
// CUSTOMER LOGOUT
// =====================================================

app.post(
    "/api/logout",
    (req, res) => {

        req.session.destroy(
            () => {

                res.json({
                    success: true
                });

            }
        );
    }
);


// =====================================================
// SESSION
// =====================================================

app.get(
    "/api/session",
    (req, res) => {

        if (
            req.session &&
            req.session.userId
        ) {

            return res.json({

                loggedIn: true,

                name:
                    req.session.userName
            });
        }


        res.json({
            loggedIn: false
        });
    }
);


// =====================================================
// STORE PAGE
// /store1
// =====================================================

app.get(
    "/:storeSlug",
    (req, res, next) => {

        const slug =
            req.params.storeSlug;


        if (
            slug === "api" ||
            slug === "admin" ||
            slug === "orders"
        ) {

            return next();
        }


        if (
            !(
                req.session &&
                req.session.userId
            )
        ) {

            return res.redirect(
                "/login.html"
            );
        }


        res.sendFile(
            path.join(
                __dirname,
                "public",
                "shop.html"
            )
        );
    }
);


// =====================================================
// GET STORE
// =====================================================

app.get(
    "/api/store/:storeSlug",
    async (req, res) => {

        try {

            const [stores] =
                await db.execute(

                    `SELECT id, name, slug
                     FROM stores
                     WHERE slug = ?`,

                    [
                        req.params.storeSlug
                    ]
                );


            if (stores.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Store not found"
                });
            }


            res.json({

                success: true,

                store:
                    stores[0]
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Server error"
            });
        }
    }
);


// =====================================================
// GET STORE PRODUCTS
// =====================================================

app.get(
    "/api/store/:storeSlug/products",
    async (req, res) => {

        try {

            const [stores] =
                await db.execute(

                    `SELECT id
                     FROM stores
                     WHERE slug = ?`,

                    [
                        req.params.storeSlug
                    ]
                );


            if (stores.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Store not found"
                });
            }


            const [products] =
                await db.execute(

                    `SELECT
                        id,
                        name,
                        price,
                        unit,
                        emoji,
                        stock
                     FROM products
                     WHERE store_id = ?
                     ORDER BY name`,

                    [
                        stores[0].id
                    ]
                );


            res.json({

                success: true,

                products
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Cannot load products"
            });
        }
    }
);


// =====================================================
// CART GET
// =====================================================

app.get(
    "/api/cart",
    requireCustomerLogin,
    async (req, res) => {

        try {

            const [items] =
                await db.execute(

                    `SELECT
                        cart_items.id AS cartItemId,
                        cart_items.quantity,
                        products.id AS productId,
                        products.name,
                        products.price,
                        products.unit,
                        products.emoji
                     FROM cart_items
                     JOIN products
                     ON products.id =
                        cart_items.product_id
                     WHERE cart_items.user_id = ?`,

                    [
                        req.session.userId
                    ]
                );


            const total =
                items.reduce(
                    (sum, item) =>
                        sum +
                        Number(item.price) *
                        Number(item.quantity),

                    0
                );


            res.json({

                success: true,

                items,

                total
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Cannot load cart"
            });
        }
    }
);


// =====================================================
// CART ADD
// =====================================================

app.post(
    "/api/cart/add",
    requireCustomerLogin,
    async (req, res) => {

        try {

            const {
                productId,
                quantity
            } = req.body;


            const qty =
                Math.max(
                    1,
                    parseInt(quantity) || 1
                );


            await db.execute(

                `INSERT INTO cart_items
                (user_id, product_id, quantity)
                VALUES (?, ?, ?)

                ON DUPLICATE KEY UPDATE
                quantity = quantity + ?`,

                [
                    req.session.userId,
                    productId,
                    qty,
                    qty
                ]
            );


            res.json({

                success: true,

                message:
                    "Product added to cart"
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Cannot add to cart"
            });
        }
    }
);


// =====================================================
// CART UPDATE
// =====================================================

app.put(
    "/api/cart/update",
    requireCustomerLogin,
    async (req, res) => {

        try {

            const {
                productId,
                quantity
            } = req.body;


            const qty =
                parseInt(quantity);


            if (
                isNaN(qty) ||
                qty <= 0
            ) {

                await db.execute(

                    `DELETE FROM cart_items
                     WHERE user_id = ?
                     AND product_id = ?`,

                    [
                        req.session.userId,
                        productId
                    ]
                );


                return res.json({

                    success: true
                });
            }


            await db.execute(

                `UPDATE cart_items
                 SET quantity = ?
                 WHERE user_id = ?
                 AND product_id = ?`,

                [
                    qty,
                    req.session.userId,
                    productId
                ]
            );


            res.json({

                success: true
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Update error"
            });
        }
    }
);


// =====================================================
// CART REMOVE
// =====================================================

app.delete(
    "/api/cart/remove/:productId",
    requireCustomerLogin,
    async (req, res) => {

        try {

            await db.execute(

                `DELETE FROM cart_items
                 WHERE user_id = ?
                 AND product_id = ?`,

                [
                    req.session.userId,
                    req.params.productId
                ]
            );


            res.json({

                success: true
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Remove error"
            });
        }
    }
);


// =====================================================
// CHECKOUT
// =====================================================

app.post(
    "/api/checkout",
    requireCustomerLogin,
    async (req, res) => {

        const connection =
            await db.getConnection();


        try {

            const {
                storeSlug,
                phone
            } = req.body;


            if (!phone) {

                connection.release();

                return res.status(400).json({

                    success: false,

                    message:
                        "Phone number required"
                });
            }


            const [stores] =
                await connection.execute(

                    `SELECT id
                     FROM stores
                     WHERE slug = ?`,

                    [
                        storeSlug
                    ]
                );


            if (stores.length === 0) {

                connection.release();

                return res.status(404).json({

                    success: false,

                    message:
                        "Store not found"
                });
            }


            const storeId =
                stores[0].id;


            const [cartItems] =
                await connection.execute(

                    `SELECT
                        products.id,
                        products.name,
                        products.price,
                        cart_items.quantity
                     FROM cart_items
                     JOIN products
                     ON products.id =
                        cart_items.product_id
                     WHERE cart_items.user_id = ?`,

                    [
                        req.session.userId
                    ]
                );


            if (cartItems.length === 0) {

                connection.release();

                return res.status(400).json({

                    success: false,

                    message:
                        "Cart is empty"
                });
            }


            const total =
                cartItems.reduce(

                    (sum, item) =>
                        sum +
                        Number(item.price) *
                        Number(item.quantity),

                    0
                );


            await connection.beginTransaction();


            const [orderResult] =
                await connection.execute(

                    `INSERT INTO orders
                    (
                        user_id,
                        store_id,
                        customer_name,
                        phone,
                        total_amount,
                        status
                    )

                    VALUES
                    (?, ?, ?, ?, ?, 'pending')`,

                    [
                        req.session.userId,
                        storeId,
                        req.session.userName,
                        phone,
                        total
                    ]
                );


            const orderId =
                orderResult.insertId;


            for (
                const item of cartItems
            ) {

                await connection.execute(

                    `INSERT INTO order_items
                    (
                        order_id,
                        product_name,
                        price,
                        quantity
                    )

                    VALUES (?, ?, ?, ?)`,

                    [
                        orderId,
                        item.name,
                        item.price,
                        item.quantity
                    ]
                );
            }


            await connection.execute(

                `DELETE FROM cart_items
                 WHERE user_id = ?`,

                [
                    req.session.userId
                ]
            );


            await connection.commit();

            connection.release();


            console.log(
                "Order created:",
                orderId
            );


            res.status(201).json({

                success: true,

                message:
                    "Order placed successfully",

                orderId
            });


        } catch (error) {

            await connection.rollback();

            connection.release();


            console.error(
                "Checkout error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Checkout failed"
            });
        }
    }
);


// =====================================================
// ADMIN LOGIN
// =====================================================

app.post(
    "/api/admin/login",
    (req, res) => {

        const {
            password
        } = req.body;


        if (
            password &&
            password ===
            process.env.ADMIN_PASSWORD
        ) {

            req.session.isAdmin = true;


            return res.json({

                success: true,

                message:
                    "Admin login successful"
            });
        }


        res.status(401).json({

            success: false,

            message:
                "Wrong admin password"
        });
    }
);


// =====================================================
// ADMIN LOGOUT
// =====================================================

app.post(
    "/api/admin/logout",
    (req, res) => {

        req.session.isAdmin = false;

        res.json({
            success: true
        });
    }
);


// =====================================================
// ADMIN DASHBOARD
// =====================================================

app.get(
    "/admin",
    (req, res) => {

        if (
            req.session &&
            req.session.isAdmin
        ) {

            return res.sendFile(

                path.join(
                    __dirname,
                    "public",
                    "admin-dashboard.html"
                )
            );
        }


        res.redirect(
            "/admin-login.html"
        );
    }
);


// =====================================================
// ADMIN ORDERS PAGE
// =====================================================

app.get(
    "/admin/orders",
    (req, res) => {

        if (
            req.session &&
            req.session.isAdmin
        ) {

            return res.sendFile(

                path.join(
                    __dirname,
                    "public",
                    "admin-orders.html"
                )
            );
        }


        res.redirect(
            "/admin-login.html"
        );
    }
);


// =====================================================
// ADMIN PRODUCTS PAGE
// =====================================================

app.get(
    "/admin/products",
    (req, res) => {

        if (
            req.session &&
            req.session.isAdmin
        ) {

            return res.sendFile(

                path.join(
                    __dirname,
                    "public",
                    "admin-products.html"
                )
            );
        }


        res.redirect(
            "/admin-login.html"
        );
    }
);


// =====================================================
// ADMIN ORDERS API
// =====================================================

app.get(
    "/api/admin/orders",
    requireAdminLogin,
    async (req, res) => {

        try {

            const [orders] =
                await db.execute(

                    `SELECT
                        orders.id,
                        orders.customer_name,
                        orders.phone,
                        orders.total_amount,
                        orders.created_at,
                        stores.name AS store_name
                     FROM orders
                     JOIN stores
                     ON stores.id =
                        orders.store_id
                     WHERE orders.status =
                        'pending'
                     ORDER BY
                        orders.created_at DESC`
                );


            for (
                const order of orders
            ) {

                const [items] =
                    await db.execute(

                        `SELECT
                            product_name,
                            price,
                            quantity
                         FROM order_items
                         WHERE order_id = ?`,

                        [
                            order.id
                        ]
                    );


                order.items =
                    items;
            }


            res.json({

                success: true,

                orders
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Cannot load orders"
            });
        }
    }
);


// =====================================================
// COMPLETE ORDER
// =====================================================

app.post(
    "/api/admin/orders/:id/complete",
    requireAdminLogin,
    async (req, res) => {

        try {

            const [result] =
                await db.execute(

                    `UPDATE orders
                     SET
                        status = 'completed',
                        completed_at = NOW()
                     WHERE id = ?`,

                    [
                        req.params.id
                    ]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Order not found"
                });
            }


            res.json({

                success: true,

                message:
                    "Order completed"
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Update error"
            });
        }
    }
);


// =====================================================
// ADMIN PRODUCTS API
// =====================================================

app.get(
    "/api/admin/products",
    requireAdminLogin,
    async (req, res) => {

        try {

            const [products] =
                await db.execute(

                    `SELECT
                        products.id,
                        products.name,
                        products.price,
                        products.unit,
                        products.emoji,
                        products.stock,
                        stores.slug AS store_slug
                     FROM products
                     JOIN stores
                     ON stores.id =
                        products.store_id
                     ORDER BY
                        products.id DESC`
                );


            res.json({

                success: true,

                products
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Cannot load products"
            });
        }
    }
);


// =====================================================
// ADD PRODUCT
// =====================================================

app.post(
    "/api/admin/products",
    requireAdminLogin,
    async (req, res) => {

        try {

            const {
                storeSlug,
                name,
                price,
                unit,
                emoji,
                stock
            } = req.body;


            if (
                !storeSlug ||
                !name ||
                !price
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Store, name and price required"
                });
            }


            const [stores] =
                await db.execute(

                    `SELECT id
                     FROM stores
                     WHERE slug = ?`,

                    [
                        storeSlug
                    ]
                );


            if (
                stores.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Store not found"
                });
            }


            await db.execute(

                `INSERT INTO products
                (
                    store_id,
                    name,
                    price,
                    unit,
                    emoji,
                    stock
                )

                VALUES (?, ?, ?, ?, ?, ?)`,

                [
                    stores[0].id,
                    name,
                    price,
                    unit || "kg",
                    emoji || "🥦",
                    stock || 100
                ]
            );


            res.status(201).json({

                success: true,

                message:
                    "Product added"
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Cannot add product"
            });
        }
    }
);


// =====================================================
// DELETE PRODUCT
// =====================================================

app.delete(
    "/api/admin/products/:id",
    requireAdminLogin,
    async (req, res) => {

        try {

            await db.execute(

                `DELETE FROM products
                 WHERE id = ?`,

                [
                    req.params.id
                ]
            );


            res.json({

                success: true,

                message:
                    "Product deleted"
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Delete error"
            });
        }
    }
);


// =====================================================
// START SERVER
// =====================================================

async function startServer() {

    try {

        await db.execute(
            "SELECT 1"
        );


        console.log(
            "✅ MySQL connected successfully"
        );


        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    `🚀 VegMarket running at http://localhost:${PORT}`
                );

            }
        );


    } catch (error) {

        console.error(
            "❌ MySQL connection failed:",
            error.message
        );
    }
}


startServer();