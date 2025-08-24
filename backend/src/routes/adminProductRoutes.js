const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');
const multer = require('multer'); //tai file
const path = require('path');
const productController = require('../controllers/productController');

const router = express.Router();

//nơi lưu ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

//tải ảnh lên
router.post('/upload', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Không có file nào được tải lên' });
  }

  const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
  res.json({ imageUrls });
});

// GET /api/admin/products?page=1&limit=10
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";       // từ khóa tìm kiếm
    const category = req.query.category || "";   // lọc theo danh mục

    // Tạo filter object
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" }; // tìm không phân biệt hoa thường
    }

    if (category) {
      filter.category = category;
    }

    const total = await Product.countDocuments(filter); // count theo filter

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name');

    // Xử lý danh mục bị null
    const formattedProducts = products.map(p => ({
      ...p.toObject(),
      category: p.category ? p.category : { _id: null, name: "Không xác định" }
    }));

    res.json({
      products: formattedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});


//Thêm
router.post('/', auth, adminAuth, async (req, res) => {
    let { name, price, description, images, category, stock } = req.body;

    try {
        // Kiểm tra xem category
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ message: "ID danh mục không hợp lệ" });
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ message: "Danh mục không tồn tại" });
        }

        const product = new Product({ name, price, description, images, category, stock });
        await product.save();

        const populatedProduct = await product.populate('category', 'name');

        res.status(201).json({ message: "Sản phẩm đã được thêm", product: populatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});

router.put('/:id', auth, adminAuth, async (req, res) => {
    const { name, price, description, images, category, stock } = req.body;

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        // Nếu category không null, kiểm tra xem có hợp lệ không
        if (category && !mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ message: "ID danh mục không hợp lệ" });
        }

        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({ message: "Danh mục không tồn tại" });
            }
        }

        // Cập nhật sản phẩm
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.images = images?.length ? images : product.images;
        product.stock = stock || product.stock;

        // Chỉ cập nhật category nếu có giá trị hợp lệ
        if (category) {
            product.category = category;
        }

        await product.save();
        const updatedProduct = await product.populate('category', 'name');

        res.json({ message: "Cập nhật thành công", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});

// Ẩn sản phẩm
router.patch('/:id/hide', auth, adminAuth, async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    return res.json({
      message: "Sản phẩm đã được ẩn thành công",
      product
    });
  } catch (error) {
    console.error("Lỗi khi ẩn sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});


router.patch('/:id/restore', auth, adminAuth, async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    return res.json({
      message: "Sản phẩm đã được khôi phục thành công",
      product
    });
  } catch (error) {
    console.error("Lỗi khi khôi phục sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});


// chỉ ad tạo option
router.post('/', auth, adminAuth, productController.createProduct);

//  ai cũng được xem sản phẩm
router.get('/:id', productController.getProductById);


// Lấy tất cả options của sản phẩm
router.get('/:productId/options', auth, adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        res.json({ options: product.options || [] });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});

// Thêm option mới vào sản phẩm
router.post('/:productId/options', auth, adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

        product.options.push(req.body); 
        await product.save();
        res.json({ message: "Đã thêm option", options: product.options });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});

// Cập nhật 1 option (dựa vào index)
router.put('/:productId/options/:index', auth, adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        const index = parseInt(req.params.index);
        if (!product || !product.options[index]) {
            return res.status(404).json({ message: "Option không tồn tại" });
        }

        product.options[index] = req.body;
        await product.save();
        res.json({ message: "Cập nhật option thành công", options: product.options });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});

// Xóa option
router.delete('/:productId/options/:index', auth, adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        const index = parseInt(req.params.index);
        if (!product || !product.options[index]) {
            return res.status(404).json({ message: "Option không tồn tại" });
        }

        product.options.splice(index, 1);
        await product.save();
        res.json({ message: "Đã xóa option", options: product.options });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});
module.exports = router;
