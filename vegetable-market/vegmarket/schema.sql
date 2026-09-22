CREATE DATABASE IF NOT EXISTS vegetable_market;

USE vegetable_market;


-- ==========================================
-- USERS
-- ==========================================

CREATE TABLE IF NOT EXISTS users (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);


-- ==========================================
-- STORES
-- ==========================================

CREATE TABLE IF NOT EXISTS stores (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    slug VARCHAR(100) NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);


-- ==========================================
-- PRODUCTS
-- ==========================================

CREATE TABLE IF NOT EXISTS products (

    id INT AUTO_INCREMENT PRIMARY KEY,

    store_id INT NOT NULL,

    name VARCHAR(150) NOT NULL,

    price DECIMAL(10,2) NOT NULL,

    unit VARCHAR(30) DEFAULT 'kg',

    emoji VARCHAR(20) DEFAULT '🥦',

    stock INT DEFAULT 100,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (store_id)
        REFERENCES stores(id)
        ON DELETE CASCADE

);


-- ==========================================
-- CART
-- ==========================================

CREATE TABLE IF NOT EXISTS cart_items (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT NOT NULL DEFAULT 1,

    UNIQUE KEY
        unique_user_product
        (user_id, product_id),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE

);


-- ==========================================
-- ORDERS
-- ==========================================

CREATE TABLE IF NOT EXISTS orders (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    store_id INT NOT NULL,

    customer_name VARCHAR(100) NOT NULL,

    phone VARCHAR(30) NOT NULL,

    total_amount DECIMAL(10,2) NOT NULL,

    status
        ENUM('pending','completed')
        DEFAULT 'pending',

    created_at
        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    completed_at
        TIMESTAMP NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id),

    FOREIGN KEY (store_id)
        REFERENCES stores(id)

);


-- ==========================================
-- ORDER ITEMS
-- ==========================================

CREATE TABLE IF NOT EXISTS order_items (

    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    product_name VARCHAR(150) NOT NULL,

    price DECIMAL(10,2) NOT NULL,

    quantity INT NOT NULL,

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE

);


-- ==========================================
-- STORE 1
-- ==========================================

INSERT INTO stores
(name, slug)

SELECT
'VegMarket Store 1',
'store1'

WHERE NOT EXISTS (

    SELECT 1
    FROM stores
    WHERE slug = 'store1'

);


-- ==========================================
-- SAMPLE PRODUCTS
-- ==========================================

INSERT INTO products
(store_id, name, price, unit, emoji, stock)

SELECT
s.id,
'Tomato',
40,
'kg',
'🍅',
100

FROM stores s

WHERE s.slug = 'store1'

AND NOT EXISTS (

    SELECT 1
    FROM products p
    WHERE p.name = 'Tomato'
);


INSERT INTO products
(store_id, name, price, unit, emoji, stock)

SELECT
s.id,
'Potato',
50,
'kg',
'🥔',
100

FROM stores s

WHERE s.slug = 'store1'

AND NOT EXISTS (

    SELECT 1
    FROM products p
    WHERE p.name = 'Potato'
);


INSERT INTO products
(store_id, name, price, unit, emoji, stock)

SELECT
s.id,
'Onion',
60,
'kg',
'🧅',
100

FROM stores s

WHERE s.slug = 'store1'

AND NOT EXISTS (

    SELECT 1
    FROM products p
    WHERE p.name = 'Onion'
);


INSERT INTO products
(store_id, name, price, unit, emoji, stock)

SELECT
s.id,
'Carrot',
70,
'kg',
'🥕',
100

FROM stores s

WHERE s.slug = 'store1'

AND NOT EXISTS (

    SELECT 1
    FROM products p
    WHERE p.name = 'Carrot'
);


INSERT INTO products
(store_id, name, price, unit, emoji, stock)

SELECT
s.id,
'Brinjal',
50,
'kg',
'🍆',
100

FROM stores s

WHERE s.slug = 'store1'

AND NOT EXISTS (

    SELECT 1
    FROM products p
    WHERE p.name = 'Brinjal'
);