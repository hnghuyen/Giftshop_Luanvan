const Coupon = require("../models/Coupon");

//Admin tạo mã giảm giá
exports.createCoupon = async (req, res) => {
    try {
        const { code, discount, expiryDate, minOrderValue } = req.body;

        // Kiểm tra nếu mã đã tồn tại
        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return res.status(400).json({ message: "Mã giảm giá đã tồn tại!" });
        }

        const coupon = new Coupon({ code, discount, expiryDate, minOrderValue });
        await coupon.save();

        res.status(201).json({ message: "Tạo mã giảm giá thành công!", coupon });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

//Admin xem danh sách mã giảm giá
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

//Admin cập nhật mã giảm giá
exports.updateCoupon = async (req, res) => {
    try {
        const { code, discount, expiryDate, minOrderValue } = req.body;
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: "Không tìm thấy mã giảm giá!" });
        }

        coupon.code = code || coupon.code;
        coupon.discount = discount || coupon.discount;
        coupon.expiryDate = expiryDate || coupon.expiryDate;
        coupon.minOrderValue = minOrderValue || coupon.minOrderValue;
        await coupon.save();

        res.json({ message: "Cập nhật thành công!", coupon });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

//Admin xóa mã giảm giá
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: "Không tìm thấy mã giảm giá!" });
        }
        await coupon.deleteOne();
        res.json({ message: "Xóa mã giảm giá thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};
