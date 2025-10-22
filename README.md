# نظام إدارة المبيعات - Sales Management System

نظام متكامل لإدارة المبيعات والمخزون والفواتير مع واجهة مستخدم عربية سهلة الاستخدام.

## المميزات

### 📊 لوحة التحكم
- عرض الإحصائيات الرئيسية للمبيعات
- أفضل المنتجات مبيعاً
- أفضل العملاء
- تنبيهات المخزون المنخفض

### 👥 إدارة العملاء
- إضافة وتعديل وحذف العملاء
- البحث عن العملاء
- عرض تاريخ الطلبات لكل عميل
- تخزين معلومات الاتصال والعنوان

### 📦 إدارة المنتجات
- إضافة وتعديل وحذف المنتجات
- تصنيف المنتجات حسب الفئات
- إدارة المخزون تلقائياً
- تنبيهات المنتجات منخفضة المخزون
- تتبع التكلفة والسعر

### 🛒 إدارة الطلبات
- إنشاء طلبات جديدة
- إضافة منتجات متعددة لكل طلب
- حساب تلقائي للمجاميع والضرائب والخصومات
- تتبع حالة الطلب وحالة الدفع
- تحديث المخزون تلقائياً عند إنشاء الطلب

### 🧾 إدارة الفواتير
- إنشاء فواتير من الطلبات
- تتبع حالة الدفع
- إضافة دفعات جزئية
- عرض تفاصيل الفاتورة الكاملة

### 📈 التقارير والإحصائيات
- تقرير المبيعات
- تقرير المخزون
- تقرير العملاء
- تقرير الأرباح مع هامش الربح
- تقارير قابلة للتخصيص حسب التاريخ

### 📑 إدارة الفئات
- تنظيم المنتجات في فئات
- إضافة وتعديل وحذف الفئات

## التقنيات المستخدمة

### Backend
- **Node.js** - بيئة تشغيل JavaScript
- **Express.js** - إطار عمل الويب
- **SQLite3** - قاعدة البيانات
- **bcrypt** - تشفير كلمات المرور
- **jsonwebtoken** - المصادقة (JWT)

### Frontend
- **HTML5** - هيكل الصفحة
- **CSS3** - التصميم والتنسيق
- **JavaScript (Vanilla)** - التفاعلية والديناميكية
- **Fetch API** - الاتصال مع الخادم

## التثبيت والتشغيل

### المتطلبات
- Node.js (الإصدار 14 أو أحدث)
- npm أو yarn

### خطوات التثبيت

1. **تثبيت المكتبات:**
```bash
npm install
```

2. **إنشاء قاعدة البيانات:**
```bash
npm run init-db
```

3. **تشغيل الخادم:**
```bash
npm start
```

للتطوير (مع إعادة التشغيل التلقائي):
```bash
npm run dev
```

4. **فتح المتصفح:**
افتح المتصفح على العنوان:
```
http://localhost:3000
```

## بيانات الدخول الافتراضية

بعد تشغيل `npm run init-db`، سيتم إنشاء حساب مدير افتراضي:

- **اسم المستخدم:** admin
- **كلمة المرور:** admin123

⚠️ **تنبيه أمني:** يُنصح بتغيير بيانات المدير الافتراضية فوراً في بيئة الإنتاج!

## هيكل المشروع

```
sales-management-system/
├── config/              # إعدادات قاعدة البيانات
├── controllers/         # المتحكمات (Business Logic)
├── models/              # نماذج البيانات
├── routes/              # مسارات API
├── middleware/          # الوسائط (المصادقة، إلخ)
├── scripts/             # نصوص مساعدة
├── database/            # ملفات قاعدة البيانات
├── public/              # الملفات الثابتة
│   ├── css/            # ملفات التنسيق
│   └── js/             # ملفات JavaScript
├── views/               # صفحات HTML
├── server.js            # ملف الخادم الرئيسي
├── package.json         # إعدادات المشروع
└── .env                 # متغيرات البيئة
```

## API Endpoints

### العملاء (Customers)
- `GET /api/customers` - جلب جميع العملاء
- `GET /api/customers/:id` - جلب عميل محدد
- `POST /api/customers` - إضافة عميل جديد
- `PUT /api/customers/:id` - تحديث عميل
- `DELETE /api/customers/:id` - حذف عميل
- `GET /api/customers/search?q=` - البحث عن عملاء

### المنتجات (Products)
- `GET /api/products` - جلب جميع المنتجات
- `GET /api/products/:id` - جلب منتج محدد
- `POST /api/products` - إضافة منتج جديد
- `PUT /api/products/:id` - تحديث منتج
- `DELETE /api/products/:id` - حذف منتج
- `GET /api/products/search?q=` - البحث عن منتجات
- `GET /api/products/low-stock` - المنتجات منخفضة المخزون

### الطلبات (Orders)
- `GET /api/orders` - جلب جميع الطلبات
- `GET /api/orders/:id` - جلب طلب محدد
- `POST /api/orders` - إنشاء طلب جديد
- `PUT /api/orders/:id/status` - تحديث حالة الطلب
- `PUT /api/orders/:id/payment-status` - تحديث حالة الدفع
- `DELETE /api/orders/:id` - حذف طلب
- `GET /api/orders/customer/:customerId` - طلبات عميل محدد
- `GET /api/orders/statistics` - إحصائيات الطلبات

### الفواتير (Invoices)
- `GET /api/invoices` - جلب جميع الفواتير
- `GET /api/invoices/:id` - جلب فاتورة محددة
- `POST /api/invoices` - إنشاء فاتورة جديدة
- `PUT /api/invoices/:id/status` - تحديث حالة الفاتورة
- `POST /api/invoices/:id/payments` - إضافة دفعة
- `DELETE /api/invoices/:id` - حذف فاتورة
- `GET /api/invoices/customer/:customerId` - فواتير عميل محدد

### الفئات (Categories)
- `GET /api/categories` - جلب جميع الفئات
- `GET /api/categories/:id` - جلب فئة محددة
- `POST /api/categories` - إضافة فئة جديدة
- `PUT /api/categories/:id` - تحديث فئة
- `DELETE /api/categories/:id` - حذف فئة

### التقارير (Reports)
- `GET /api/reports/dashboard` - إحصائيات لوحة التحكم
- `GET /api/reports/sales` - تقرير المبيعات
- `GET /api/reports/inventory` - تقرير المخزون
- `GET /api/reports/customers` - تقرير العملاء
- `GET /api/reports/profit` - تقرير الأرباح

## قاعدة البيانات

يستخدم النظام SQLite مع الجداول التالية:

- **users** - المستخدمين
- **customers** - العملاء
- **categories** - الفئات
- **products** - المنتجات
- **orders** - الطلبات
- **order_items** - تفاصيل الطلبات
- **invoices** - الفواتير
- **payments** - المدفوعات
- **inventory_movements** - حركة المخزون

## المساهمة

نرحب بالمساهمات! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف LICENSE للتفاصيل.

## الدعم

إذا واجهت أي مشاكل أو لديك اقتراحات، يرجى فتح Issue في GitHub.

## التطويرات المستقبلية

- [ ] نظام المصادقة والصلاحيات
- [ ] إضافة الضرائب التلقائية
- [ ] تصدير التقارير إلى PDF/Excel
- [ ] إشعارات البريد الإلكتروني
- [ ] دعم العملات المتعددة
- [ ] تطبيق موبايل
- [ ] نسخ احتياطية تلقائية
- [ ] تكامل مع أنظمة الدفع الإلكتروني

## الإصدار

النسخة الحالية: **1.0.0**

---

تم التطوير بـ ❤️ لإدارة مبيعات أفضل
