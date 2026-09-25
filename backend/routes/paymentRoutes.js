const router = require("express").Router();
const { auth } = require("../middleware/auth");
router.post("/process", auth, (req, res) => {
  const { paymentMethod = "MockCard" } = req.body;
  res.json({
    status: "success",
    transactionId: "TXN_" + Date.now(),
    paymentMethod,
    message: "Payment processed successfully (demo)",
  });
});
module.exports = router;
