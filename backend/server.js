require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectMongoDB = require("./config/mongodb");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectMongoDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/admin", express.static(path.join(__dirname, "../admin")));
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/"))
    return res.status(404).json({ message: "API route not found" });
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () =>
  console.log(`Innovexa Project 1 running at http://localhost:${PORT}`)
);
