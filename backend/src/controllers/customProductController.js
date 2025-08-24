const Product = require('../models/Product');
const CustomProduct = require('../models/CustomProduct');

exports.createCustomProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const selectedOptions = req.body.customOptions;

    if (!selectedOptions || typeof selectedOptions !== 'object') {
      return res.status(400).json({ message: 'customOptions không hợp lệ' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let totalPrice = product.price;
    const customOptionsToSave = {}; // object mới để lưu vào DB

    product.options.forEach((option) => {
      const userValue = selectedOptions[option.name];
      if (!userValue && option.required) {
        throw new Error(`Thiếu lựa chọn bắt buộc: ${option.name}`);
      }

      if ((option.type === 'select' || option.type === 'image-select') && userValue) {
        const choice = option.choices.find(c => c.value === userValue);
        if (choice) {
          totalPrice += choice.extraPrice;
          customOptionsToSave[option.name] = {
            label: choice.label,  // lưu nhãn hiển thị
            value: choice.value
          };
        }
      }

      if (option.type === 'text' && userValue) {
        // kiểm tra maxLength
        if (option.maxLength > 0 && userValue.length > option.maxLength) {
          throw new Error(
            `Lỗi: ${option.name} vượt quá số kí tự tối đa (${option.maxLength})`
          );
        }

        totalPrice += option.extraPricePerChar * userValue.length;
        customOptionsToSave[option.name] = {
          label: option.name, // lưu tên option làm label
          value: userValue
        };
      }

    });

    const customProduct = new CustomProduct({
      productId,
      customOptions: customOptionsToSave,
      totalPrice,
      userId: req.user?._id || null
    });

    await customProduct.save();

    res.status(201).json({
      message: 'Thiết kế sản phẩm thành công',
      productName: product.name,
      totalPrice,
      customOptions: customOptionsToSave,
      customProductId: customProduct._id
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
