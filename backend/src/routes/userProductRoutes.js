const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const {
  getProductSoldCount
} = require('../controllers/productController');

router.get('/product/:id/sold', getProductSoldCount);

// Lấy danh sách sản phẩm cho User
router.get('/product', async (req, res) => {
  try {
    // chỉ lấy sản phẩm đang active
    const products = await Product.find({ isActive: true })
      .populate('category', 'name');

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
});

// GET: Lấy sản phẩm mới nhất 
router.get('/new_products', async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  const sortOrder = req.query.sort === 'asc' ? 1 : -1;

  try {
    const products = await Product.find()
      .sort({ createdAt: sortOrder })
      .limit(limit);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm', error });
  }
});

router.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err });
  }
});

// GET /products/related?categoryId=xxx&excludeId=yyy
router.get('/products/related', async (req, res) => {
  try {
    const { categoryId, excludeId } = req.query;
    if (!categoryId) {
      return res.status(400).json({ message: "Thiếu categoryId" });
    }

    const filter = {
      category: categoryId,
    };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const relatedProducts = await Product.find(filter)
      .limit(8)
      .populate('category', 'name');

    res.json(relatedProducts);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
});

module.exports = router;
