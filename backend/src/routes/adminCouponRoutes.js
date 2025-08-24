const express = require('express');
const Coupon = require('../models/Coupon');
const { auth, adminAuth } = require('../middlewares/authMiddleware');
const router = express.Router();

// Tạo mã mới
router.post('/create', auth, adminAuth, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.json({ message: 'Tạo mã thành công', coupon });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo mã', err });
  }
});

// Lấy tất cả mã
router.get('/all', auth, adminAuth, async (req, res) => {
  const coupons = await Coupon.find();
  res.json(coupons);
});

// Kiểm tra mã từ client gửi
router.post('/validate', async (req, res) => {
  const { code, orderValue } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) return res.status(400).json({ message: 'Mã không hợp lệ' });

  if (coupon.expiryDate < Date.now())
    return res.status(400).json({ message: 'Mã đã hết hạn' });

  if (coupon.usedCount >= coupon.maxUses)
    return res.status(400).json({ message: 'Mã đã được sử dụng hết' });

  if (orderValue < coupon.minOrderValue)
    return res.status(400).json({ message: `Đơn tối thiểu ${coupon.minOrderValue} để dùng mã` });

  // OK
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (orderValue * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  res.json({ message: 'Áp dụng mã thành công', discount });
});

router.get('/available', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      expiryDate: { $gte: now },
      $expr: { $lt: ['$usedCount', '$maxUses'] }
    });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy mã giảm giá' });
  }
});

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá để xóa' });
    }
    res.json({ message: 'Xóa mã giảm giá thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa mã giảm giá', error: err.message });
  }
});

router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { code, discountValue, discountType, maxUses, expiryDate } = req.body;

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code,
        discountValue,
        discountType,
        maxUses,
        expiryDate: new Date(expiryDate),
      },
      { new: true }
    );

    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }

    res.json({ message: 'Cập nhật mã giảm giá thành công', coupon: updatedCoupon });
  } catch (err) {
    console.error('Lỗi khi cập nhật mã:', err);
    res.status(500).json({ message: 'Lỗi khi cập nhật mã' });
  }
});

module.exports = router;
