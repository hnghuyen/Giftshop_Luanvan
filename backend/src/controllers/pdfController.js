const PDFDocument = require('pdfkit');
const path = require('path');
const Order = require('../models/Order');
const bwipjs = require('bwip-js');

const exportOrderCOD = async (req, res) => {

  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Tạo PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Disposition', `attachment; filename=order_${orderId}_COD.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    const fontPath = path.join(__dirname, '../../fonts/Roboto-Regular.ttf');
    doc.font(fontPath);

    // Tiêu đề
    doc.fontSize(20).text('Phiếu Giao Hàng - Ship COD', { align: 'center' });
    doc.moveDown();

    // Thông tin khách hàng
    doc.fontSize(12).text(`Tên khách: ${order.user.name}`);
    doc.text(`Email: ${order.user.email}`);
    doc.text(`Địa chỉ: ${order.shippingAddress}`);
    doc.text(`Số điện thoại: ${order.phoneNumber}`);
    doc.moveDown();

    // Thông tin đơn hàng
    doc.text(`Mã đơn hàng: ${order._id}`);
    doc.text(`Ngày đặt: ${order.createdAt.toLocaleString()}`);
    doc.text(`Tổng tiền: ${order.totalPrice.toLocaleString()} VND`);
    doc.text(`Hình thức thanh toán: Thanh toán khi nhận hàng`);
    doc.moveDown();

    // Danh sách sản phẩm
    doc.fontSize(14).text('Danh sách sản phẩm:');
    order.orderItems.forEach((item, index) => {
      doc.fontSize(12).text(
        `${index + 1}. ${item.product.name} - SL: ${item.quantity} - Giá: ${(item.price * item.quantity).toLocaleString()} VND`
      );

      if (item.customOptions && Object.keys(item.customOptions).length > 0) {
        Object.entries(item.customOptions).forEach(([key, value]) => {
          // Nếu là object có label thì dùng label, còn không thì fallback sang value
          const display = typeof value === 'object' && value.label ? value.label : value;
          doc.fontSize(10).text(`   - ${key}: ${display}`);
        });
      }
    });
    doc.moveDown();

    // Sinh mã vạch từ ID đơn hàng
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: order._id.toString(),
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });

    // Chèn mã vạch vào PDF
    doc.image(barcodeBuffer, { fit: [250, 80], align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi tạo phiếu COD' });
  }
};

const exportOrderPDF = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name price');

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=order_${orderId}.pdf`);

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        const fontPath = path.join(__dirname, '../../fonts/Roboto-Regular.ttf');
        doc.font(fontPath);

        doc.fontSize(20).text('HÓA ĐƠN ĐƠN HÀNG', { align: 'center' }).moveDown();
        doc.fontSize(12).text(`Mã đơn: ${order._id}`);
        doc.text(`Ngày đặt: ${new Date(order.createdAt).toLocaleString()}`);
        doc.text(`Khách hàng: ${order.user.name}`);
        doc.text(`Email: ${order.user.email}`);
        doc.text(`Địa chỉ: ${order.shippingAddress}`, { width: 500 });
        doc.moveDown();

        doc.fontSize(14).text('Danh sách sản phẩm', { underline: true });
        doc.moveDown(0.5);

        order.orderItems.forEach((item, index) => {
        doc.fontSize(12).text(
          `${index + 1}. ${item.product.name} - SL: ${item.quantity} x ${item.price.toLocaleString()}đ`
        );

        if (item.customOptions && Object.keys(item.customOptions).length > 0) {
          Object.entries(item.customOptions).forEach(([key, value]) => {
            // Nếu là object có label thì dùng label, còn không thì fallback sang value
            const display = typeof value === 'object' && value.label ? value.label : value;
            doc.fontSize(10).text(`   - ${key}: ${display}`);
          });
        }
      });
        doc.moveDown();
        doc.fontSize(14).text(`Tổng cộng: ${order.totalPrice.toLocaleString()}đ`, { align: 'right' });

        doc.moveDown(3);
        doc.fontSize(12).text('Người lập hóa đơn', { align: 'right' });
        doc.moveDown(2);
        doc.fontSize(12).text('(Ký tên)', { align: 'right' });

        doc.end();
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Lỗi server', error });
        }
    }
};

module.exports = { exportOrderPDF, exportOrderCOD };
