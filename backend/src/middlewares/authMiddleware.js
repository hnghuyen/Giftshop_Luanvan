const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const auth = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Không có token, quyền truy cập bị từ chối!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user = await User.findById(decoded.id).select("-password");

        if (!user) {
            user = await Admin.findById(decoded.id).select("-password");
        }

        if (!user) {
            return res.status(401).json({ message: "Người dùng không tồn tại!" });
        }
        if (user.isBanned) {   
            return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa!" });
        }

        // // Nếu có passwordChangedAt, kiểm tra thời điểm
        // if (user.passwordChangedAt) {
        // const changedTime = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
        // if (decoded.iat < changedTime) {
        //     return res.status(401).json({ message: "Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại!" });
        // }
        // }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token đã hết hạn!" });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Token không hợp lệ!" });
        }
        return res.status(401).json({ message: "Xác thực thất bại!" });
    }
};


// Middleware kiểm tra quyền Admin
const adminAuth = (req, res, next) => {
    if (req.user?.role === "admin" || req.user?.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: "Bạn không có quyền truy cập!" });
    }
};

module.exports = { auth, adminAuth };
