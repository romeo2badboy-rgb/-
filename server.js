require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/browsing', require('./routes/browsing'));

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'حدث خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// بدء الخادم
async function startServer() {
  try {
    await db.connect();
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 نظام إدارة المبيعات يعمل الآن`);
      console.log(`📡 الخادم: http://localhost:${PORT}`);
      console.log(`🗄️  قاعدة البيانات: متصلة`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('خطأ في بدء الخادم:', error.message);
    process.exit(1);
  }
}

startServer();

// إغلاق الاتصال عند إيقاف الخادم
process.on('SIGINT', async () => {
  console.log('\nجاري إيقاف الخادم...');
  await db.close();
  process.exit(0);
});
