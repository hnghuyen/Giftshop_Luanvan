const Product = require('../models/Product');
const Order = require("../models/Order");

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      image,
      category,
      stock,
      options // 🎯 phần mới: danh sách tùy chọn
    } = req.body;

    const newProduct = new Product({
      name,
      price,
      description,
      image,
      category,
      stock,
      options
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductSoldCount = async (req, res) => {
  try {
    const productId = req.params.id;

    const orders = await Order.find({
      "orderItems.product": productId,
      status: { $in: ["Hoàn thành", "Đã giao hàng"] }
    });

    let totalSold = 0;
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.product.toString() === productId) {
          totalSold += item.quantity;
        }
      });
    });

    res.json({ sold: totalSold });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
