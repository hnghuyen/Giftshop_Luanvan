const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middlewares/authMiddleware");

// Import cả 2 controller function
const { getSalesReport, getAdminStats } = require("../controllers/statsController");

//(doanh thu, đơn hàng, top khách, top sản phẩm)
router.get("/report", auth, adminAuth, getSalesReport);    
//số lượng user, sp, đơn trong tháng
router.get("/all", auth, adminAuth, getAdminStats);  

module.exports = router;
