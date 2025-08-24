const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log("Nhận yêu cầu:", { name, email, role });

  try {
    const existing = await User.findOne({ email });
    console.log(" Tìm email:", existing);

    if (existing) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const newUser = new User({
      name,
      email,
      password, // để model tự hash
      role: role || 'user'
    });

    console.log("User khởi tạo:", newUser);

    await newUser.save();
    console.log("Lưu user thành công");

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'giftshop-secret',
      { expiresIn: '1d' }
    );

    console.log(" Token tạo thành công");

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      _id: newUser._id
    });

  } catch (err) {
    console.error(" Đăng ký lỗi:", err.message);
    console.error("Chi tiết:", err);
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};
