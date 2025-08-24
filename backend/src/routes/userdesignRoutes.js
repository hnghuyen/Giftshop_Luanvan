const express = require('express');
const router = express.Router();
const Design = require('../models/CustomProduct');
const { auth } = require('../middlewares/authMiddleware'); 

// tạo
router.post('/', auth, async (req, res) => {
  try {
    const { productId, customOptions, image, totalPrice  } = req.body;

    const design = new Design({
      userId: req.user._id,  // Lấy từ token
      productId,
      customOptions,
      image,
      totalPrice
    });

    await design.save();
    res.status(201).json(design);
  } catch (error) {
    console.error('Lỗi khi lưu thiết kế:', error);
    res.status(500).json({ message: 'Lỗi khi lưu thiết kế.' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.user._id })
      .populate('productId')
      .sort({ createdAt: -1 });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách thiết kế.' });
  }
});

// Lấy 1 thiết kế theo ID
router.get('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id).populate('productId');
    if (!design) {
      return res.status(404).json({ message: 'Không tìm thấy thiết kế.' });
    }

    // if (design.userId.toString() !== req.user._id) {
    //   return res.status(403).json({ message: 'Bạn không có quyền truy cập thiết kế này.' });
    // }

    res.json(design);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thiết kế.' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!design) {
      return res.status(404).json({ message: 'Thiết kế không tồn tại.' });
    }

    res.json({ message: 'Đã xóa thiết kế.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa thiết kế.' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ message: 'Không tìm thấy thiết kế.' });
    }

    // Kiểm tra người dùng có quyền sửa không
    if (design.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa thiết kế này.' });
    }

    // Cập nhật các trường được phép
    design.customOptions = req.body.customOptions || design.customOptions;
    design.note = req.body.note || design.note;

    await design.save();
    res.json({ message: 'Cập nhật thành công.', design });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật thiết kế.' });
  }
});

module.exports = router;