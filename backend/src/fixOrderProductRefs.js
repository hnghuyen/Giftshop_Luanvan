require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order'); 
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/giftshop';

mongoose.connect(MONGO_URI)
  .then(async () => {
    const orders = await Order.find();
    let updated = 0;

    for (const order of orders) {
      let modified = false;
      for (const item of order.orderItems) {
        if (item.product && typeof item.product === 'object' && item.product._id) {
          item.product = item.product._id;
          modified = true;
        }
      }
      if (modified) {
        await order.save();
        updated++;
      }
    }

    console.log(`Đã cập nhật ${updated} đơn hàng sai kiểu dữ liệu.`);
    process.exit();
  })
  .catch((err) => {
    console.error("Kết nối MongoDB thất bại:", err);
    process.exit(1);
  });
