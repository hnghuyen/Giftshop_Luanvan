const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { auth, adminAuth } = require("../middlewares/authMiddleware"); 

const router = express.Router();

// Tạo token JWT với role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};


// Đăng ký user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Kiểm tra email đã tồn tại 
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || "user"
    });

    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});



// Đăng nhập user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Kiểm tra user có tồn tại không
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Kiểm tra user có bị khóa không
    if (user.isBanned) {
      return res
        .status(403)
        .json({ message: "Tài khoản này đã bị khóa, vui lòng liên hệ admin!" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Tạo token đăng nhập
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.json({
      message: "Đăng nhập thành công!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
});

router.put('/update', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const updateData = req.body
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
    res.json(updatedUser)
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật thông tin.' })
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // không trả về mật khẩu
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

router.get('/info/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('address phone');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin user' });
  }
});

// Xóa tài khoản cá nhân
router.delete('/delete-account', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa' });
    }

    res.json({ message: 'Tài khoản đã được xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa tài khoản', error: err.message });
  }
});

router.put("/change-password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });
    }

    const user = await User.findById(req.user.id); // dùng .id thay vì ._id
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordChangedAt = Date.now();
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});


module.exports = router;




