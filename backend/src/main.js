require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Admin Routes
app.use('/api/admin/categories', require('./routes/adminCategoryRoutes'));
app.use('/api/admin/products', require('./routes/adminProductRoutes'));
app.use('/api/admin/orders', require('./routes/adminOrderRoutes'));
app.use('/api/admin/reviews', require('./routes/adminReviewRoutes'));
app.use('/api/admin/users', require('./routes/adminManageUserRoutes'));
app.use('/api/admin/inventory', require('./routes/adminInventoryRoutes'));
app.use('/api/admin/coupons', require('./routes/adminCouponRoutes'));
app.use('/api/admin/stats', require('./routes/adminStatsRoutes'));

app.use('/api/admin', require('./routes/adminRoutes'));

// User Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/users/orders', require('./routes/userOrderRoutes'));
app.use('/api/users/reviews', require('./routes/userReviewRoutes')); 
app.use('/api/cart', require('./routes/userCartRoutes'));
app.use('/api/users', require('./routes/userProductRoutes'));
app.use('/api/users/coupons', require('./routes/userCouponRoutes'));

app.use('/api/custom-products', require('./routes/customProductRoutes'));
app.use('/api/users/design', require('./routes/userdesignRoutes'));

//chat
app.use('/api/chat', require('./routes/chat'));

// 🌐 Test Route
app.get('/', (req, res) => {
  res.send('Chào mừng đến với shop quà tặng!');
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});

