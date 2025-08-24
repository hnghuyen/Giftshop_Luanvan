const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'amount'], default: 'percentage' }, // %
  discountValue: { type: Number, required: true }, // 10% hoặc 50000
  minOrderValue: { type: Number, default: 0 }, //đơn từ 200K mới áp dụng
  maxUses: { type: Number, default: 100 }, // số lượt dùng tối đa
  usedCount: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
