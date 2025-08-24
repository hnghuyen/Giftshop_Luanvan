const express = require("express");
const Product = require("../models/Product");
const { auth, adminAuth } = require("../middlewares/authMiddleware");
const Review = require('../models/Review');

const router = express.Router();

router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate('productId', 'name');
    res.json(reviews);
  } catch (err) {
    console.error('Lỗi khi lấy đánh giá:', err); 
    res.status(500).json({ message: 'Lỗi khi lấy đánh giá' });
  }
});


// Xóa đánh giá
router.delete('/delete/:id', auth, adminAuth, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa đánh giá' });
  }
});

module.exports = router;
