const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Đăng nhập Admin
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await User.findOne({ email, role: "admin" });

        if (!admin) {
            return res.status(400).json({ message: "Admin không tồn tại hoặc sai thông tin đăng nhập!" });
        }

        if (admin.isBanned) {
            return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa!" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        const token = jwt.sign({ _id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, admin });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", error });
    }
};