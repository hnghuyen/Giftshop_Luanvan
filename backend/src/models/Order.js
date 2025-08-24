const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      orderItems: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
          quantity: { type: Number, required: true, default: 1 },
          price: { type: Number, required: true },
          customOptions: { type: mongoose.Schema.Types.Mixed, default: {} },
        }
      ],
      totalPrice: { type: Number, required: true },
      discountAmount: { type: Number, default: 0 },  
      originalPrice: { type: Number },       
      couponCode: { type: String, default: null },
      shippingAddress: { type: String, required: true },
      phoneNumber: { type: String, required: true }, 
    
      paymentMethod: {
        type: String,
        enum: ["COD", "ZaloPay"],
        required: true
      },

      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
      },
      status: {
        type: String,
        enum: ["Chờ xác nhận", "Đã xác nhận", "Chờ xử lý", "Chờ lấy hàng", "Đã lấy hàng", "Đang giao", "Đã giao hàng", "Hoàn thành", "Đã hủy"],
        default: "Chờ xác nhận",
      },
    },
    { timestamps: true }
  )  

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
