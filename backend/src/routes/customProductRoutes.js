const express = require('express');
const router = express.Router();
const controller = require('../controllers/customProductController');
const { auth } = require("../middlewares/authMiddleware");

// kh.hang co tkhoan
router.post('/:productId', auth, controller.createCustomProduct);

module.exports = router;
