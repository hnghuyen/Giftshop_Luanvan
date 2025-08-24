const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Review = require('../models/Review');
const { auth } = require('../middlewares/authMiddleware');
const Order = require('../models/Order'); 

router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, comment, orderId } = req.body;

     if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
    }

    const order = await Order.findOne({
    _id: orderId,
    user: req.user.id,
    status: 'Hoàn thành',
    orderItems: {
        $elemMatch: {
        product: new mongoose.Types.ObjectId(productId)
        }
    }
    });

    if (!order) {
      return res.status(403).json({ message: 'Chỉ được đánh giá khi đơn hàng đã hoàn thành.' });
    }

    // Kiểm tra đã đánh giá chưa
    const existing = await Review.findOne({ userId: req.user.id, productId, orderId }); 
    if (existing) { 
      return res.status(200).json({ alreadyReviewed: true, review: existing }); }

    const newReview = new Review({
      userId: req.user.id,
      productId,
      orderId,
      rating,
      comment,
    });
    await newReview.save();

    res.status(201).json({ alreadyReviewed: false, review: newReview });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo đánh giá' });
  }
});

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', '_id name editCount'); 
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy đánh giá' });
  }
});

// Cập nhật đánh giá
router.put("/:id", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findOne({ _id: req.params.id, userId: req.user.id });
    if (!review) {
      return res.status(403).json({ message: "Không tìm thấy hoặc bạn không có quyền sửa." });
    }

    // Chặn sửa quá 1 lần
    if (review.editCount >= 1) {
      return res.status(400).json({ message: "Bạn chỉ được sửa đánh giá 1 lần." });
    }

    review.rating = rating;
    review.comment = comment;
    review.editCount += 1;

    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật đánh giá." });
  }
});



module.exports = router;