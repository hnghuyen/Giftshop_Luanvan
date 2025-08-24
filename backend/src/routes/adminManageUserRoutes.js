const express = require("express");
const User = require("../models/User");
const { auth, adminAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

// Lấy danh sách tất cả user
router.get("/all", auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find().select("-password"); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!" });
    }
});

// Xem chi tiết một user
router.get("/:id", auth, adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!" });
    }
});

// 3️⃣ Khóa hoặc mở khóa user
router.put("/:id/toggle-ban", auth, adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
        user.isBanned = !user.isBanned; 
        await user.save();
        res.json({ message: `User đã được ${user.isBanned ? "khóa" : "mở khóa"}` });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!" });
    }
});



module.exports = router;