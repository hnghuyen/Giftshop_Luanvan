const express = require("express");
const { getInventory, updateStock, getLowStockProducts } = require("../controllers/inventoryController");
const { auth, adminAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

// Lấy danh sách sản phẩm trong kho
router.get("/all", auth, adminAuth, getInventory);

// Cập nhật số lượng tồn kho
router.put("/:productId", auth, adminAuth, updateStock);

// Lấy danh sách sản phẩm sắp hết hàng
router.get("/low-stock", auth, adminAuth, getLowStockProducts);

module.exports = router;
