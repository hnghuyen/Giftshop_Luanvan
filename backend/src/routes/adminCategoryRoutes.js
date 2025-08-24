const express = require('express');
const Category = require('../models/Category');
const { auth, adminAuth } = require('../middlewares/authMiddleware');
const Product = require('../models/Product');

const router = express.Router();

// Thêm danh mục mới
router.post('/', auth, adminAuth, async (req, res) => {
    const { name } = req.body;
    try {
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ message: 'Danh mục đã tồn tại' });
        }

        const category = await Category.create({ name });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
});

// Lấy danh sách danh mục
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
});

// Cập nhật danh mục
router.put('/:id', auth, adminAuth, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        category.name = req.body.name || category.name;
        await category.save();

        res.json({ message: 'Cập nhật thành công', category });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
});

// Xóa danh mục
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Kiểm tra danh mục tồn tại
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        // Kiểm tra xem có sản phẩm thuộc danh mục này không
        const productCount = await Product.countDocuments({ category: categoryId });
        if (productCount > 0) {
            return res.status(400).json({
                message: 'Không thể xóa danh mục vì vẫn còn sản phẩm thuộc danh mục này'
            });
        }

        // Nếu không có sản phẩm, tiến hành xóa
        await category.deleteOne();
        res.json({ message: 'Xóa danh mục thành công' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
});

module.exports = router;
