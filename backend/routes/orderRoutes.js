const router = require("express").Router();
const c = require("../controllers/orderController");
const { auth } = require("../middleware/auth");
router.use(auth);
router.post("/", c.createOrder);
router.get("/", c.myOrders);
router.get("/:id", c.getOrder);
module.exports = router;
