const router = require("express").Router();
const { auth, admin } = require("../middleware/auth");
router.use(auth, admin);

router.get("/dashboard", async (req, res) => {
  res.json({
    products: 6,
    customers: 12,
    orders: 8,
    sales: 15400,
  });
});

module.exports = router;
