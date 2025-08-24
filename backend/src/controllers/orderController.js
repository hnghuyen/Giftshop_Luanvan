const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

// User đặt hàng
const createOrder = async (req, res) => {
    try {
        let discountAmount = 0;
        const { orderItems, shippingAddress, paymentMethod, totalPrice, couponCode, phoneNumber } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "Không có sản phẩm trong đơn hàng!" });
        }

        const originalPrice = totalPrice;
        let finalPrice = totalPrice;

        // Xử lý coupon nếu có
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode });
            if (!coupon) return res.status(400).json({ message: "Mã giảm giá không hợp lệ!" });
            if (new Date(coupon.expiryDate) < new Date()) return res.status(400).json({ message: "Mã giảm giá đã hết hạn!" });
            if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ message: "Mã đã hết lượt sử dụng!" });
            if (totalPrice < coupon.minOrderValue) {
                return res.status(400).json({ message: `Đơn hàng phải từ ${coupon.minOrderValue}đ để áp dụng mã.` });
            }

            // Tính giảm giá
            discountAmount = coupon.discountType === 'percentage' ? (totalPrice * coupon.discountValue) / 100 : coupon.discountValue;
            finalPrice -= discountAmount;
            if (finalPrice < 0) finalPrice = 0;

            coupon.usedCount += 1;
            await coupon.save();
        }

        // Kiểm tra và giảm số lượng kho
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ message: `Sản phẩm ${product?.name || 'không xác định'} không đủ hàng!` });
            }
        }
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            product.stock -= item.quantity;
            await product.save();
        }

        // Xử lý customOptions để lưu label + value
        const processedItems = [];
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            const customOptionsWithLabel = {};

            if (item.customOptions) {
                for (const [key, value] of Object.entries(item.customOptions)) {
                    const option = product.options.find(o => o.name === key);
                    if (!option) continue;

                    if ((option.type === 'select' || option.type === 'image-select') && value) {
                        const choice = option.choices.find(c => c.value === value);
                        if (choice) {
                            customOptionsWithLabel[key] = { label: choice.label, value: choice.value };
                        } else {
                            customOptionsWithLabel[key] = { label: value, value };
                        }
                    } else if (option.type === 'text' && value) {
                        customOptionsWithLabel[key] = { label: value, value };
                    }
                }
            }

            processedItems.push({
                product: item.product,
                quantity: item.quantity,
                price: item.price,
                customOptions: customOptionsWithLabel
            });
        }

        const order = new Order({
            user: req.user._id,
            orderItems: processedItems,
            shippingAddress,
            phoneNumber,
            paymentMethod,
            originalPrice,
            discountAmount,
            totalPrice: finalPrice,
            couponCode,
            status: "Chờ xác nhận"
        });

        await order.save();
        res.status(201).json({ message: "Đặt hàng thành công!", order });

    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// User hủy đơn hàng (chỉ khi đang chờ xác nhận)
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        if (order.status !== "Chờ xác nhận") {
            return res.status(400).json({ message: "Chỉ có thể hủy đơn hàng khi đang chờ xác nhận" });
        }

        // Hoàn lại số lượng kho
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            product.stock += item.quantity;
            await product.save();
        }

        order.status = "Đã hủy";
        await order.save();

        res.json({ message: "Hủy đơn hàng thành công!", order });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

//User xem danh sách đơn hàng của chính mình
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};


//Nơi lưu đơn hàng
const placeOrder = async (req, res) => {
    try {
        const processedItems = [];
        for (const item of req.body.orderItems) {
            const product = await Product.findById(item.product);
            const customOptionsWithLabel = {};

            if (item.customOptions) {
                for (const [key, value] of Object.entries(item.customOptions)) {
                    const option = product.options.find(o => o.name === key);
                    if (!option) continue;

                    if ((option.type === 'select' || option.type === 'image-select') && value) {
                        const choice = option.choices.find(c => c.value === value);
                        if (choice) {
                            customOptionsWithLabel[key] = { label: choice.label, value: choice.value };
                        } else {
                            customOptionsWithLabel[key] = { label: value, value };
                        }
                    } else if (option.type === 'text' && value) {
                        customOptionsWithLabel[key] = { label: value, value };
                    }
                }
            }

            processedItems.push({
                product: item.product,
                quantity: item.quantity,
                price: item.price,
                customOptions: customOptionsWithLabel
            });
        }

        const newOrder = new Order({
            user: req.user._id,
            orderItems: processedItems,
            totalPrice: req.body.totalPrice,
            shippingAddress: req.body.shippingAddress,
            phoneNumber: req.body.phoneNumber,
            paymentMethod: req.body.paymentMethod,
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);

    } catch (error) {
        res.status(500).json({ message: "Không thể đặt hàng.", error });
    }
};
  
//Admin xem tất cả đơn hàng
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// admin cập nhật trạng thái đơn hàng 
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        order.status = req.body.status || order.status;
        await order.save();

        res.json({ message: "Cập nhật trạng thái đơn hàng thành công!", order });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

module.exports = { createOrder, cancelOrder, placeOrder, getUserOrders, getAllOrders, updateOrderStatus};
