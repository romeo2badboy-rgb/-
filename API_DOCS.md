# توثيق API - نظام إدارة المبيعات

## معلومات عامة

- **Base URL:** `http://localhost:3000/api`
- **Content-Type:** `application/json`
- **الترميز:** UTF-8

## استجابة API القياسية

جميع الاستجابات تأتي بالشكل التالي:

```json
{
  "success": true/false,
  "data": {},
  "message": "رسالة اختيارية"
}
```

---

## العملاء (Customers)

### 1. جلب جميع العملاء
```http
GET /api/customers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "phone": "0501234567",
      "address": "شارع الملك فهد",
      "city": "الرياض",
      "country": "السعودية",
      "notes": "عميل مميز",
      "created_at": "2024-01-01 10:00:00"
    }
  ]
}
```

### 2. جلب عميل محدد
```http
GET /api/customers/:id
```

### 3. إضافة عميل جديد
```http
POST /api/customers
```

**Request Body:**
```json
{
  "name": "فاطمة علي",
  "email": "fatima@example.com",
  "phone": "0509876543",
  "address": "شارع الأمير سلطان",
  "city": "جدة",
  "country": "السعودية",
  "notes": ""
}
```

### 4. تحديث عميل
```http
PUT /api/customers/:id
```

### 5. حذف عميل
```http
DELETE /api/customers/:id
```

### 6. البحث عن عملاء
```http
GET /api/customers/search?q=أحمد
```

---

## المنتجات (Products)

### 1. جلب جميع المنتجات
```http
GET /api/products
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "لابتوب ديل",
      "description": "لابتوب ديل XPS 15",
      "category_id": 1,
      "category_name": "إلكترونيات",
      "price": 4500.00,
      "cost": 3500.00,
      "sku": "LAP001",
      "barcode": "123456789",
      "stock_quantity": 10,
      "min_stock_level": 2,
      "created_at": "2024-01-01 10:00:00"
    }
  ]
}
```

### 2. إضافة منتج جديد
```http
POST /api/products
```

**Request Body:**
```json
{
  "name": "هاتف سامسونج",
  "description": "هاتف سامسونج جالاكسي S23",
  "category_id": 1,
  "price": 2800.00,
  "cost": 2200.00,
  "sku": "PHN001",
  "barcode": "987654321",
  "stock_quantity": 15,
  "min_stock_level": 3
}
```

### 3. تحديث منتج
```http
PUT /api/products/:id
```

### 4. حذف منتج
```http
DELETE /api/products/:id
```

### 5. تحديث المخزون
```http
PUT /api/products/:id/stock
```

**Request Body:**
```json
{
  "quantity": 25
}
```

### 6. المنتجات منخفضة المخزون
```http
GET /api/products/low-stock
```

### 7. البحث عن منتجات
```http
GET /api/products/search?q=لابتوب
```

---

## الطلبات (Orders)

### 1. جلب جميع الطلبات
```http
GET /api/orders
```

### 2. إنشاء طلب جديد
```http
POST /api/orders
```

**Request Body:**
```json
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 4500.00,
      "discount": 0
    },
    {
      "product_id": 2,
      "quantity": 1,
      "unit_price": 2800.00,
      "discount": 100
    }
  ],
  "discount": 500,
  "tax": 975,
  "payment_method": "cash",
  "notes": "طلب عاجل"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": 1,
    "customer_name": "أحمد محمد",
    "order_date": "2024-01-01 10:00:00",
    "total_amount": 11700.00,
    "discount": 500,
    "tax": 975,
    "final_amount": 12175.00,
    "status": "pending",
    "payment_status": "unpaid",
    "items": [...]
  },
  "message": "تم إنشاء الطلب بنجاح"
}
```

### 3. جلب طلب محدد
```http
GET /api/orders/:id
```

### 4. تحديث حالة الطلب
```http
PUT /api/orders/:id/status
```

**Request Body:**
```json
{
  "status": "completed"
}
```

الحالات المتاحة: `pending`, `processing`, `completed`, `cancelled`

### 5. تحديث حالة الدفع
```http
PUT /api/orders/:id/payment-status
```

**Request Body:**
```json
{
  "payment_status": "paid"
}
```

حالات الدفع: `unpaid`, `partial`, `paid`

### 6. حذف طلب
```http
DELETE /api/orders/:id
```

### 7. طلبات عميل محدد
```http
GET /api/orders/customer/:customerId
```

### 8. إحصائيات الطلبات
```http
GET /api/orders/statistics
```

---

## الفواتير (Invoices)

### 1. جلب جميع الفواتير
```http
GET /api/invoices
```

### 2. إنشاء فاتورة جديدة
```http
POST /api/invoices
```

**Request Body:**
```json
{
  "order_id": 1,
  "customer_id": 1,
  "due_date": "2024-02-01",
  "notes": "يرجى الدفع خلال 30 يوم"
}
```

### 3. جلب فاتورة محددة
```http
GET /api/invoices/:id
```

### 4. تحديث حالة الفاتورة
```http
PUT /api/invoices/:id/status
```

**Request Body:**
```json
{
  "status": "paid"
}
```

### 5. إضافة دفعة
```http
POST /api/invoices/:id/payments
```

**Request Body:**
```json
{
  "amount": 5000.00,
  "payment_method": "bank_transfer",
  "reference_number": "TRX123456",
  "notes": "دفعة جزئية"
}
```

### 6. حذف فاتورة
```http
DELETE /api/invoices/:id
```

### 7. فواتير عميل محدد
```http
GET /api/invoices/customer/:customerId
```

---

## الفئات (Categories)

### 1. جلب جميع الفئات
```http
GET /api/categories
```

### 2. إضافة فئة جديدة
```http
POST /api/categories
```

**Request Body:**
```json
{
  "name": "إلكترونيات",
  "description": "أجهزة إلكترونية ومعدات تقنية"
}
```

### 3. تحديث فئة
```http
PUT /api/categories/:id
```

### 4. حذف فئة
```http
DELETE /api/categories/:id
```

---

## التقارير (Reports)

### 1. إحصائيات لوحة التحكم
```http
GET /api/reports/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sales": {
      "total_orders": 150,
      "total_revenue": 450000.00,
      "paid_revenue": 420000.00,
      "unpaid_revenue": 30000.00
    },
    "customers": 85,
    "products": 120,
    "lowStockProducts": 8,
    "pendingInvoices": {
      "count": 12,
      "amount": 35000.00
    },
    "topProducts": [...],
    "topCustomers": [...],
    "last7Days": [...]
  }
}
```

### 2. تقرير المبيعات
```http
GET /api/reports/sales?start_date=2024-01-01&end_date=2024-12-31
```

### 3. تقرير المخزون
```http
GET /api/reports/inventory
```

### 4. تقرير العملاء
```http
GET /api/reports/customers
```

### 5. تقرير الأرباح
```http
GET /api/reports/profit?start_date=2024-01-01&end_date=2024-12-31
```

---

## أكواد الحالة (Status Codes)

- `200` - نجاح
- `201` - تم الإنشاء بنجاح
- `400` - خطأ في البيانات المدخلة
- `404` - غير موجود
- `500` - خطأ في الخادم

## معالجة الأخطاء

في حالة حدوث خطأ، ستكون الاستجابة:

```json
{
  "success": false,
  "message": "وصف الخطأ"
}
```

---

## أمثلة باستخدام cURL

### إضافة عميل جديد
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "محمد أحمد",
    "email": "mohammed@example.com",
    "phone": "0555555555",
    "city": "الرياض"
  }'
```

### إنشاء طلب جديد
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {
        "product_id": 1,
        "quantity": 1,
        "unit_price": 4500.00
      }
    ],
    "discount": 0,
    "tax": 292.50,
    "payment_method": "cash"
  }'
```

---

تم إنشاء التوثيق بواسطة نظام إدارة المبيعات v1.0.0
