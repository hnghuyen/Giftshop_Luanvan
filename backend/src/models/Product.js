const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  type: { type: String, enum: ['select', 'image-select', 'text'], required: true },
  required: { type: Boolean, default: false },
  choices: [
    {
      label: String,   // nhãn hiển thị: "Hồng", "Nâu", "Áo trái tim"
      value: String,   // "pink", "heart-shirt.png"
      extraPrice: { type: Number, default: 0 },
      imageUrl: { type: String }
    }
  ],
  extraPricePerChar: { type: Number, default: 0 }, //  type = text
  maxLength: { type: Number, default: 0 }
});


const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
    stock: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },

    options: [optionSchema]

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
