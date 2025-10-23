require('dotenv').config();
const db = require('../config/database');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
  try {
    await db.connect();

    console.log('جاري إنشاء الجداول...');

    // جدول المستخدمين
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // جدول العملاء
    await db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // جدول الفئات
    await db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // جدول المنتجات
    await db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category_id INTEGER,
        price REAL NOT NULL,
        cost REAL DEFAULT 0,
        sku TEXT UNIQUE,
        barcode TEXT,
        stock_quantity INTEGER DEFAULT 0,
        min_stock_level INTEGER DEFAULT 0,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // جدول الطلبات
    await db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        total_amount REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        final_amount REAL DEFAULT 0,
        payment_method TEXT,
        payment_status TEXT DEFAULT 'unpaid',
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // جدول تفاصيل الطلبات
    await db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        discount REAL DEFAULT 0,
        subtotal REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // جدول الفواتير
    await db.run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        order_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        due_date DATETIME,
        total_amount REAL NOT NULL,
        paid_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'unpaid',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    // جدول حركة المخزون
    await db.run(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        movement_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        reference_type TEXT,
        reference_id INTEGER,
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // جدول المدفوعات
    await db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        payment_method TEXT NOT NULL,
        reference_number TEXT,
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // جدول الموردين
    await db.run(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        payment_terms TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // جدول ربط المنتجات بالموردين
    await db.run(`
      CREATE TABLE IF NOT EXISTS product_suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        supplier_id INTEGER NOT NULL,
        cost_price REAL,
        is_primary INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
      )
    `);

    // جدول القسائم والخصومات
    await db.run(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        value REAL NOT NULL,
        min_order_amount REAL DEFAULT 0,
        max_discount REAL,
        usage_limit INTEGER,
        usage_count INTEGER DEFAULT 0,
        product_id INTEGER,
        category_id INTEGER,
        expiry_date DATETIME,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // جدول المرتجعات
    await db.run(`
      CREATE TABLE IF NOT EXISTS returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        return_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        reason TEXT,
        total_amount REAL DEFAULT 0,
        refund_amount REAL DEFAULT 0,
        refund_method TEXT,
        notes TEXT,
        processed_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (processed_by) REFERENCES users(id)
      )
    `);

    // جدول تفاصيل المرتجعات
    await db.run(`
      CREATE TABLE IF NOT EXISTS return_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        return_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        subtotal REAL NOT NULL,
        condition TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // جدول المبالغ المستردة
    await db.run(`
      CREATE TABLE IF NOT EXISTS refunds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        return_id INTEGER NOT NULL,
        order_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        method TEXT NOT NULL,
        reference_number TEXT,
        status TEXT DEFAULT 'pending',
        processed_date DATETIME,
        notes TEXT,
        processed_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (return_id) REFERENCES returns(id),
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (processed_by) REFERENCES users(id)
      )
    `);

    console.log('تم إنشاء جميع الجداول بنجاح!');

    // إنشاء مستخدم افتراضي
    const hashedPassword = await bcrypt.hash('admin123', 10);
    try {
      await db.run(
        'INSERT INTO users (username, password, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', hashedPassword, 'المدير', 'admin@example.com', 'admin']
      );
      console.log('تم إنشاء حساب المدير الافتراضي:');
      console.log('اسم المستخدم: admin');
      console.log('كلمة المرور: admin123');
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        console.log('حساب المدير موجود مسبقاً');
      }
    }

    // إضافة بيانات تجريبية
    console.log('\nجاري إضافة بيانات تجريبية...');

    // إضافة فئات تجريبية
    const categories = [
      ['إلكترونيات', 'أجهزة إلكترونية ومعدات تقنية'],
      ['ملابس', 'ملابس رجالية ونسائية'],
      ['أغذية', 'مواد غذائية ومشروبات'],
      ['أثاث', 'أثاث منزلي ومكتبي']
    ];

    for (const cat of categories) {
      try {
        await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', cat);
      } catch (err) {
        // تجاهل الأخطاء إذا كانت البيانات موجودة
      }
    }

    // إضافة عملاء تجريبيين
    const customers = [
      ['أحمد محمد', 'ahmed@example.com', '0501234567', 'شارع الملك فهد', 'الرياض', 'السعودية', 'عميل مميز'],
      ['فاطمة علي', 'fatima@example.com', '0509876543', 'شارع الأمير سلطان', 'جدة', 'السعودية', ''],
      ['محمد خالد', 'mohammed@example.com', '0555555555', 'شارع العليا', 'الرياض', 'السعودية', 'عميل جديد']
    ];

    for (const customer of customers) {
      try {
        await db.run(
          'INSERT INTO customers (name, email, phone, address, city, country, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          customer
        );
      } catch (err) {
        // تجاهل الأخطاء إذا كانت البيانات موجودة
      }
    }

    // إضافة منتجات تجريبية
    const products = [
      ['لابتوب ديل', 'لابتوب ديل XPS 15', 1, 4500.00, 3500.00, 'LAP001', '123456789', 10, 2],
      ['هاتف سامسونج', 'هاتف سامسونج جالاكسي S23', 1, 2800.00, 2200.00, 'PHN001', '987654321', 15, 3],
      ['قميص قطني', 'قميص قطني رجالي', 2, 120.00, 60.00, 'CLT001', '111222333', 50, 10],
      ['طاولة مكتب', 'طاولة مكتب خشبية', 4, 850.00, 500.00, 'FRN001', '444555666', 8, 2]
    ];

    for (const product of products) {
      try {
        await db.run(
          'INSERT INTO products (name, description, category_id, price, cost, sku, barcode, stock_quantity, min_stock_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          product
        );
      } catch (err) {
        // تجاهل الأخطاء إذا كانت البيانات موجودة
      }
    }

    // إضافة موردين تجريبيين
    const suppliers = [
      ['شركة التقنية المتقدمة', 'أحمد السالم', '0501111111', 'tech@example.com', 'شارع الملك عبدالعزيز', 'الرياض', 'السعودية', 'دفع عند الاستلام', 'مورد أساسي للإلكترونيات'],
      ['مؤسسة الملابس الحديثة', 'سارة محمد', '0502222222', 'clothes@example.com', 'شارع التحلية', 'جدة', 'السعودية', 'آجل 30 يوم', 'مورد الملابس'],
      ['شركة الأثاث الفاخر', 'خالد عبدالله', '0503333333', 'furniture@example.com', 'طريق الملك فهد', 'الدمام', 'السعودية', 'نقدي', 'مورد الأثاث']
    ];

    for (const supplier of suppliers) {
      try {
        await db.run(
          'INSERT INTO suppliers (name, contact_person, phone, email, address, city, country, payment_terms, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          supplier
        );
      } catch (err) {
        // تجاهل الأخطاء إذا كانت البيانات موجودة
      }
    }

    console.log('تم إضافة البيانات التجريبية بنجاح!');
    console.log('\nقاعدة البيانات جاهزة للاستخدام!');

  } catch (error) {
    console.error('خطأ في إنشاء قاعدة البيانات:', error.message);
  } finally {
    await db.close();
  }
}

initializeDatabase();
