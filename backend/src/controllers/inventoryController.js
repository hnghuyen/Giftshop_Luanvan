const Product = require("../models/Product");

//Lấy danh sách sản phẩm trong kho
exports.getInventory = async (req, res) => {
  try {
    const products = await Product.find().select("name stock");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

//Cập nhật số lượng tồn kho
exports.updateStock = async (req, res) => {
  const { productId } = req.params;
  const { stock } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    product.stock = stock;
    await product.save();
    res.json({ message: "Cập nhật tồn kho thành công", product });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Kiểm tra sản phẩm sắp hết hàng
exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).select(
      "name stock"
    ); // Lọc sản phẩm có stock < 10
    res.json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};
