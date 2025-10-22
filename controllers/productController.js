const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const id = await Product.create(req.body);
    const product = await Product.getById(id);
    res.status(201).json({ success: true, data: product, message: 'تم إضافة المنتج بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.body);
    res.json({ success: true, data: product, message: 'تم تحديث بيانات المنتج بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await Product.delete(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.updateStock(req.params.id, quantity);
    res.json({ success: true, data: product, message: 'تم تحديث المخزون بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const products = await Product.getLowStock();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال كلمة البحث' });
    }
    const products = await Product.search(q);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
