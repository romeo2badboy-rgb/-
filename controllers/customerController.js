const Customer = require('../models/Customer');

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.getAll();
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'العميل غير موجود' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const id = await Customer.create(req.body);
    const customer = await Customer.getById(id);
    res.status(201).json({ success: true, data: customer, message: 'تم إضافة العميل بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.update(req.params.id, req.body);
    res.json({ success: true, data: customer, message: 'تم تحديث بيانات العميل بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const result = await Customer.delete(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchCustomers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال كلمة البحث' });
    }
    const customers = await Customer.search(q);
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
