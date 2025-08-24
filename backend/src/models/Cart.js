const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        default: 1
      },
      customOptions: {
        type: Object,
        default: {} // lưu ácc lựa chọn.
      },
      price: {
        type: Number,
        required: false //luu giá sau khi + thêm thiết kế
      }
    }
  ]
});

module.exports = mongoose.model('Cart', cartSchema);
