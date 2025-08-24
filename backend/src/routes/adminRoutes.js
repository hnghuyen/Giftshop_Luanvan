const express = require('express');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");


const router = express.Router();

// Hàm tạo token
const generateToken = (id) => {
    return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Đăng ký admin
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const admin = await Admin.create({
        name,
        email,
        password,
        role: "admin",
    });

    if (admin) {
        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin._id),
        });
    } else {
        res.status(400).json({ message: 'Không thể đăng ký' });
    }
});

// Đăng nhập admin
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
        res.json({
            token: generateToken(admin._id),
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
            });
    } else {
        res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }
});

module.exports = router;
