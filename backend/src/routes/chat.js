const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

const keywordMap = {
  'bạn gái': ['gấu', 'hoa', 'vòng'],
  'bạn trai': ['ly', 'cốc', 'sổ', 'khung ảnh'],
  'sinh nhật': ['gấu', 'ly', 'thiệp'],
  'valentine': ['vòng', 'gấu', 'hoa'],
  'tốt nghiệp': ['sổ', 'khung ảnh', 'hoa'],
  'bạn thân': ['gấu', 'hoa', 'ly', 'cốc', 'vòng'],
};

router.post('/', async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();
  let matchedKeywords = [];

  // tim key goi ý
  for (const [key, keywords] of Object.entries(keywordMap)) {
    if (lowerMsg.includes(key)) {
      matchedKeywords = keywords;
      break;
    }
  }

  try {
    if (matchedKeywords.length === 0) {
      return res.json({
        reply: 'Tớ chưa hiểu ý bạn, bạn có thể nói rõ hơn không? Ví dụ: "Tặng quà sinh nhật cho bạn gái"'
      });
    }

    const regex = new RegExp(matchedKeywords.join('|'), 'i');
    const products = await Product.find({ name: { $regex: regex } }).limit(5);

    if (products.length === 0) {
      return res.json({ reply: 'Tớ không tìm thấy sản phẩm phù hợp, bạn thử nói kiểu khác nhé huhu' });
    }

    const reply = `Tớ gợi ý nè:\n` + products.map(p => `- ${p.name}`).join('\n');
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server rồi 😥' });
  }
});

module.exports = router;
