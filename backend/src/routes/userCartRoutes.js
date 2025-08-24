// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Lấy giỏ hàng
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId })
      .populate({
        path: 'items.productId',
        select: 'name price options images stock'
      });

    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa sản phẩm
router.post('/remove', async (req, res) => {
  const { userId, productId, customOptions } = req.body;
  const cart = await Cart.findOne({ userId });

  if (cart) {
    cart.items = cart.items.filter(item =>
      item.productId.toString() !== productId ||
      (customOptions && JSON.stringify(item.customOptions || {}) !== JSON.stringify(customOptions))
    );
    await cart.save();
  }

  res.json(cart);
});


// Thêm sản phẩm vào giỏ
router.post('/add', async (req, res) => {
  const { userId, productId, quantity, customOptions = {}, price } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ message: 'Thiếu userId, productId hoặc quantity' });
  }

  try {
    // Lấy thông tin sản phẩm để kiểm tra tồn kho
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

    // Kiểm tra số lượng nhập vào không vượt quá stock
    if (quantity > product.stock) {
      return res.status(400).json({ message: `Chỉ còn ${product.stock} sản phẩm trong kho` });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const isCustomized = customOptions && Object.keys(customOptions).length > 0;

    if (isCustomized) {
      // Tìm item có cùng sản phẩm & cùng thiết kế
      const existingItem = cart.items.find(item =>
        item.productId.toString() === productId &&
        JSON.stringify(item.customOptions || {}) === JSON.stringify(customOptions)
      );

      if (existingItem) {
        // Kiểm tra tổng số lượng không vượt stock
        if (existingItem.quantity + quantity > product.stock) {
          return res.status(400).json({ message: `Chỉ còn ${product.stock - existingItem.quantity} sản phẩm khả dụng` });
        }
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, customOptions, price });
      }

    } else {
      // (sản phẩm thường)
      const existingItem = cart.items.find(item =>
        item.productId.toString() === productId &&
        (!item.customOptions || Object.keys(item.customOptions).length === 0)
      );

      if (existingItem) {
        if (existingItem.quantity + quantity > product.stock) {
          return res.status(400).json({ message: `Chỉ còn ${product.stock - existingItem.quantity} sản phẩm khả dụng` });
        }
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Lỗi khi thêm giỏ hàng:", error);
    res.status(500).json({ message: 'Lỗi server khi thêm vào giỏ hàng' });
  }
});
  
module.exports = router
