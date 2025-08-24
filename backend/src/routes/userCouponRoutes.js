const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { auth } = require('../middlewares/authMiddleware');

// Lấy danh sách coupon còn hạn & còn lượt dùng
router.get('/available', auth, async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      expiryDate: { $gt: now },
      $expr: { $lt: ['$usedCount', '$maxUses'] }
    });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy mã giảm giá', error: err.message });
  }
});

module.exports = router;
