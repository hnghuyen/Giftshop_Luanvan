const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { auth, adminAuth } = require("../middlewares/authMiddleware");
const { exportOrderPDF, exportOrderCOD } = require('../controllers/pdfController');

const router = express.Router();

router.get('/:id/export-pdf', auth, adminAuth, exportOrderPDF);
router.get('/:id/export-cod', exportOrderCOD);

// GET /api/admin/orders?page=1&limit=10
router.get("/all", auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const status = req.query.status || "";

    // Build aggregation pipeline
    const pipeline = [];

    // Lookup user
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      }
    });
    pipeline.push({ $unwind: "$user" });

    // Filter theo status **sau lookup cũng được vì vẫn có field status**
    if (status) {
      pipeline.push({ $match: { status } });
    }

    // Filter theo search (user name/email hoặc productName)
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user.name": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
            { "orderItems": { $elemMatch: { productName: { $regex: search, $options: "i" } } } }
          ]
        }
      });
    }

    // Tổng số đơn hàng thỏa điều kiện
    const totalResult = await Order.aggregate([...pipeline, { $count: "total" }]);
    const total = totalResult[0] ? totalResult[0].total : 0;

    // Phân trang + sắp xếp
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const orders = await Order.aggregate(pipeline);

    res.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err });
  }
});




// Chi tiết đơn hàng
router.get("/:id", auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product", "name options");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Xác nhận đơn hàng
router.put("/:id/confirm", auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (order.status !== "Chờ xác nhận") {
      return res.status(400).json({ message: "Đơn hàng đã được xử lý trước đó" });
    }

    order.status = "Đã xác nhận";
    await order.save();

    const updated = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("orderItems.product", "name");

    res.json({ message: "Xác nhận đơn hàng thành công", order: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Hủy đơn hàng & hoàn kho
router.put("/:id/cancel", auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (order.status !== "Chờ xác nhận") {
      return res.status(400).json({ message: "Chỉ có thể hủy đơn hàng khi đang chờ xác nhận" });
    }

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = "Đã hủy";
    await order.save();

    const updated = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("orderItems.product", "name");

    res.json({ message: "Đơn hàng đã bị hủy và hoàn kho", order: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

//giao
router.put("/:id/deliver", auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.status !== "Đã lấy hàng") {
      return res.status(400).json({ message: "Chỉ có thể giao hàng khi đã lấy hàng" });
    }

    order.status = "Đã giao hàng";
    await order.save();

    res.json({ message: "Đơn hàng đã được đánh dấu là đã giao", order });
  } catch (error) {
    console.error("Lỗi khi xử lý giao hàng:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái giao hàng", error: error.message });
  }
});

// Chuyển sang "Chờ lấy hàng"
router.put("/:id/ready", auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (order.status !== "Đã xác nhận") {
      return res.status(400).json({ message: "Chỉ có thể chuyển sang 'Chờ lấy hàng' sau khi đơn đã xác nhận" });
    }

    order.status = "Chờ lấy hàng";
    await order.save();

    res.json({ message: "Đơn hàng đã chuyển sang 'Chờ lấy hàng'", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái", error });
  }
});

// Chuyển sang "Đã lấy hàng"
router.put("/:id/picked", auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (order.status !== "Chờ lấy hàng") {
      return res.status(400).json({ message: "Chỉ có thể chuyển sang 'Đã lấy hàng' sau khi đơn đang ở 'Chờ lấy hàng'" });
    }

    order.status = "Đã lấy hàng";
    await order.save();

    res.json({ message: "Đơn hàng đã chuyển sang 'Đã lấy hàng'", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái", error });
  }
});


// Xóa đơn hàng
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    await order.deleteOne();
    res.json({ message: "Xóa đơn hàng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Middleware xử lý lỗi toàn cục
router.use((err, req, res, next) => {
  console.error("Middleware bắt lỗi:", err.stack);
  res.status(500).json({ message: "Lỗi toàn cục", error: err.message });
});

// Route test xem raw data (không populate)
router.get("/test/raw-orders", auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error("Lỗi test raw-orders:", error);
    res.status(500).json({ message: "Lỗi test", error: error.message });
  }
});


module.exports = router;
