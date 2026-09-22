# Vegetable Market — முழு Merged Project (README தமிழில்)

## இது என்ன?
Fe-Be-Db (Register/Login) + files (Order system) — **இரண்டையும் இணைத்து** ஒரே
Amazon மாதிரி vegetable marketplace:

1. Customer **Register/Login** பண்ணுவாரு
2. Login ஆனதும் **vegetables (Tomato, Onion, Potato...)** பாப்பாரு, quantity தேர்ந்து **Cart**-ல போடுவாரு
3. **Checkout** பண்ணா, ஒரே order-ஆ MySQL-ல save ஆகும் (எல்லா vegetables-உம் உள்ள)
4. Owner `/orders`-ல password போட்டு, orders பாத்து delivery ஆனதும் "Complete" பண்ணுவாரு
5. Owner `/admin/products`-ல புது vegetables add/delete பண்ணுவாரு

---

## ⚠️ முக்கியம் — Old project-ஓட Confusion வராம இருக்க

நீங்க முன்னாடி "files" project (free-text order form) run பண்ணீங்க. இது **அந்த project இல்ல** —
முழுசா புது, better project. **Old "files" folder-ஐ முழுசா விட்டுடுங்க**, இந்த புது
`vegetable-market` folder-ஐ மட்டும் run பண்ணுங்க. Confusion வராம இதை separate
folder-ல வையுங்க.

---

## Ubuntu-ல Setup — Step by Step

### Step 1 — புது folder-க்கு இந்த zip-ஐ extract பண்ணுங்க
```bash
mkdir -p ~/vegetable-market
cd ~/vegetable-market
unzip vegetable-market.zip
```

### Step 2 — Dependencies install
```bash
npm install
```

### Step 3 — MySQL database create பண்ணுங்க
```bash
sudo mysql < schema.sql
```
இது `vegetable_market` database-ஐயும், 6 tables-ஐயும் (users, stores, products,
cart_items, orders, order_items), சில sample vegetables-ஐயும் create பண்ணிடும்.

### Step 4 — உங்க MySQL user-க்கு access கொடுங்க
நீங்க முன்னாடி `infinity` user-க்கு password `infinity@123` ன்னு set பண்ணிருந்தீங்க
(அது தான் இப்போ வேலை செய்யுது). அதே user-ஐ இந்த database-க்கும் access கொடுங்க:
```bash
sudo mysql -e "GRANT ALL PRIVILEGES ON vegetable_market.* TO 'infinity'@'localhost'; FLUSH PRIVILEGES;"
```

### Step 5 — `db.env` file சரிபாருங்க
```bash
cat db.env
```
இப்படி இருக்கணும் (உங்க password ஏற்கனவே இதுல set பண்ணி இருக்கேன்):
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=infinity
DB_PASSWORD=infinity@123
DB_NAME=vegetable_market
ADMIN_PASSWORD=changeme123
SESSION_SECRET=vegetable-market-super-secret-change-this
PORT=3000
```
வேற password வச்சிருந்தீங்கன்னா, இங்க அதையே update பண்ணுங்க.

### Step 6 — Tables வந்துச்சான்னு confirm பண்ணுங்க
```bash
sudo mysql vegetable_market -e "SHOW TABLES;"
```
`users, stores, products, cart_items, orders, order_items` — 6 tables வரணும்.

### Step 7 — Server ஓட்டுங்க
```bash
node server.js
```
`✅ MySQL connected successfully` + `🚀 Server running at http://localhost:3000` வரணும்.

---

## URLs

| URL | யாருக்கு | என்ன நடக்கும் |
|---|---|---|
| `/` | Customer | Register / Login page |
| `/store1` | Customer (login தேவை) | Vegetables browse பண்ணி Cart-ல போடலாம் |
| `/cart.html` | Customer (login தேவை) | Cart பாத்து Checkout பண்ணலாம் |
| `/orders` | Owner (Admin) | Password கேட்கும், pending orders list |
| `/admin/products` | Owner (Admin) | Vegetables add/delete பண்ணலாம் |

**Admin Password:** `db.env`-ல `ADMIN_PASSWORD=changeme123` — இதை மாத்திக்கலாம்.

---

## Data Flow

1. Customer `/` -ல Register/Login → session create ஆகும் (MySQL `users` table)
2. `/store1` -ல vegetables MySQL `products` table-ல இருந்து load ஆகும்
3. Cart-ல "Add" பண்ணா → MySQL `cart_items` table-ல insert/update ஆகும்
4. Checkout பண்ணா:
   - MySQL `orders` table-ல ஒரு row insert
   - அந்த order-ஓட ஒவ்வொரு vegetable-உம் `order_items` table-ல insert
   - `cart_items` clear ஆகும்
5. Owner `/orders`-ல pending orders (status='pending') பாப்பாரு
6. "Complete" பண்ணா → status `completed`-ஆ மாறும் → pending list-ல இருந்து மறையும்
   (DB-ல delete ஆகாது, history-க்கு இருக்கும்)

---

## புது Store Add பண்ண

```sql
INSERT INTO stores (name, slug) VALUES ('My Second Store', 'store2');
```
அப்புறம் `/admin/products`-ல Store Slug field-ல `store2` போட்டு vegetables add பண்ணுங்க.
Customer `/store2` URL-ல அந்த store-ஐ பாக்கலாம் — code மாத்தத் தேவையே இல்ல.

---

## புது Feature — UPI Payment (Simple QR method)

### ஏற்கனவே database create பண்ணி இருந்தா (Migration தேவை)
```bash
mysql -u root -p vegetable_market < add-payment-feature.sql
```
இது `orders` table-ல `payment_method`, `payment_status`, `upi_reference` columns add பண்ணும்.
(புதுசா schema.sql run பண்றவங்க இதை தனியா run பண்ண தேவையில்ல, schema.sql-லேயே இருக்கு)

### `db.env`-ல உங்க UPI ID போடுங்க
```
UPI_ID=yourname@upi
STORE_DISPLAY_NAME=Fresh Vegetable Store
```
(`yourname@upi`-ஐ உங்க real UPI ID-ஆ மாத்துங்க — Ex: `9876543210@ybl`, `yourname@okhdfcbank`)

### எப்படி வேலை செய்யுது
1. Cart-ல Checkout பண்றப்போ, customer **"UPI Pay"** தேர்ந்தா
2. Order total amount-ஓட ஒரு **QR code** தானா காட்டப்படும் (`upi://pay?...` deep link வெச்சு)
3. Customer அந்த QR-ஐ Google Pay/PhonePe/Paytm-ல scan பண்ணி pay பண்ணுவாரு
4. Transaction reference number (optional) போடலாம்
5. Order MySQL-ல `payment_status = 'pending'`-ஆ save ஆகும்
6. Owner `/orders`-ல அந்த order-ல **"💰 Payment வந்தது ✅"** button பாப்பாரு
7. Bank/UPI app-ல paisa வந்துச்சுன்னு owner **manual-ஆ confirm** பண்ணி, அந்த button அழுத்துவாரு
8. Status `verified`-ஆ மாறும் → அப்புறம் delivery பண்ணி "Complete" பண்ணலாம்

⚠️ **கவனம்:** இது **automatic verification இல்ல** — Owner தான் manual-ஆ பணம் வந்துச்சுனு பாத்து confirm பண்ணணும் (bank SMS/app notification பாத்து). முழு automatic வேணும்னா Razorpay/PayU மாதிரி gateway business account தேவை.

---

## Security Notes
- Password `db.env`-ல தான், code-ல hardcode இல்ல
- Customer password-கள் bcrypt hash ஆகி தான் MySQL-ல save ஆகும் (plain text இல்ல)
- Admin password இப்போ plain text `db.env`-ல இருக்கு — production-க்கு போகும்போது
  இதையும் bcrypt hash பண்ணலாம் (தேவைனா அடுத்த step-ல பண்ணித் தரேன்)
- Live server-ல HTTPS (SSL) கண்டிப்பா வையுங்க
