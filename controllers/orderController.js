const Order = require('../models/Order');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.getAll();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1; // استخدام معرف المستخدم المسجل
    const orderId = await Order.create(req.body, userId);
    const order = await Order.getById(orderId);
    res.status(201).json({ success: true, data: order, message: 'تم إنشاء الطلب بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.updateStatus(req.params.id, status);
    res.json({ success: true, data: order, message: 'تم تحديث حالة الطلب بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { payment_status } = req.body;
    const order = await Order.updatePaymentStatus(req.params.id, payment_status);
    res.json({ success: true, data: order, message: 'تم تحديث حالة الدفع بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const result = await Order.delete(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await Order.getByCustomer(req.params.customerId);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const stats = await Order.getStatistics();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
