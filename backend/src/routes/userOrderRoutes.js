const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Review = require("../models/Review");
const { auth } = require("../middlewares/authMiddleware");
const { createOrder, cancelOrder, getUserOrders, getAllOrders, updateOrderStatus } = require("../controllers/orderController");


const router = express.Router();

//  User đặt đơn hàng
// Sử dụng controller
router.post("/", auth, createOrder);


// xem đh
router.get("/:id", auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: "orderItems.product",
                select: "name price options isActive images"
            });

        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        if (!order.user.equals(req.user._id)) {
            return res.status(403).json({ message: "Bạn không có quyền xem đơn hàng này" });
        }

        // Lấy review của user
        const reviews = await Review.find({ orderId: order._id, userId: req.user._id });

        // Gán property reviews cho order (ép về string)
        const orderObj = order.toObject(); 
        orderObj.reviews = reviews.map(r => ({
            productId: String(r.productId),
            rating: r.rating,
            comment: r.comment
        }));

        res.json(orderObj);
    } catch (error) {
        console.error(error); // log lỗi chi tiết
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});


// User xem danh sách đơn hàng của chính mình
router.get("/", auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});

//User hủy đơn hàng (đang chờ xác nhận)
router.put("/:id/cancel", auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền hủy đơn hàng này" });
        }

        if (order.status !== "Chờ xác nhận") {
            return res.status(400).json({ message: "Chỉ có thể hủy đơn hàng khi đang chờ xác nhận" });
        }

        // Hoàn lại số lượng kho
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        order.status = "Đã hủy";
        await order.save();

        res.json({ message: "Hủy đơn hàng thành công!", order });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});

// POST /api/orders/:id/complete
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    // Chỉ chủ đơn hàng mới được xác nhận
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền xác nhận đơn hàng này' });
    }

    if (order.status !== 'Đã giao hàng') {
      return res.status(400).json({ message: 'Đơn hàng chưa được giao' });
    }

    order.status = 'Hoàn thành';
    await order.save();

    res.json({ message: 'Đơn hàng đã được hoàn thành!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
