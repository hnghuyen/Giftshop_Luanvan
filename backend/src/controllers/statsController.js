const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// Lấy báo cáo thống kê chi tiết
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Chuyển sang Date nếu có
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Tạo điều kiện match
    let match = { status: "Hoàn thành" };
    if (start && end) match.createdAt = { $gte: start, $lte: end };

    // 1. Tổng doanh thu
    const totalRevenue = await Order.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    // 2. Số đơn hoàn thành
    const completedOrders = await Order.countDocuments(match);

    // 3. Số sản phẩm đã bán
    const totalProductsSold = await Order.aggregate([
      { $match: match },
      { $unwind: "$orderItems" },
      { $group: { _id: null, totalSold: { $sum: "$orderItems.quantity" } } }
    ]);

    // 4. Số đơn bị hủy
    let cancelMatch = { status: "Đã hủy" };
    if (start && end) cancelMatch.createdAt = { $gte: start, $lte: end };
    const canceledOrders = await Order.countDocuments(cancelMatch);

    // 5. Top 5 khách hàng
    const topCustomers = await Order.aggregate([
      { $match: match },
      { $group: { _id: "$user", totalSpent: { $sum: "$totalPrice" } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" }
    ]);

    // 6. Top 5 sản phẩm bán chạy
    const bestSellingProducts = await Order.aggregate([
      { $match: match },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: { $sum: "$orderItems.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" }
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      completedOrders,
      totalProductsSold: totalProductsSold[0]?.totalSold || 0,
      canceledOrders,
      topCustomers,
      bestSellingProducts
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};


// 📌 Route đơn giản cho dashboard admin
const getAdminStats = async (req, res) => {
  try {
    const [userCount, productCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments()
    ]);

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const orderCount = await Order.countDocuments({
      createdAt: { $gte: firstDay, $lte: lastDay }
    });

    res.json({ userCount, productCount, orderCount });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy thống kê" });
  }
};

module.exports = {
  getSalesReport,
  getAdminStats
};
