const Invoice = require('../models/Invoice');

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.getAll();
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.getById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const invoiceId = await Invoice.create(req.body, userId);
    const invoice = await Invoice.getById(invoiceId);
    res.status(201).json({ success: true, data: invoice, message: 'تم إنشاء الفاتورة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.updateStatus(req.params.id, status);
    res.json({ success: true, data: invoice, message: 'تم تحديث حالة الفاتورة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const invoice = await Invoice.addPayment(req.params.id, req.body, userId);
    res.json({ success: true, data: invoice, message: 'تم إضافة الدفعة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const result = await Invoice.delete(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInvoicesByCustomer = async (req, res) => {
  try {
    const invoices = await Invoice.getByCustomer(req.params.customerId);
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
