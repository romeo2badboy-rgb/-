const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database');

// Initialize Gemini AI with 2.5 Flash
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDgRQ4rATcxVXOjUUS18UjsweGoLEGMSyQ');

// Define comprehensive AI tools for COMPLETE site control
const tools = [
    // ========== CUSTOMER MANAGEMENT ==========
    {
        name: 'addCustomer',
        description: 'إضافة عميل جديد إلى قاعدة البيانات',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'اسم العميل الكامل' },
                email: { type: 'string', description: 'البريد الإلكتروني' },
                phone: { type: 'string', description: 'رقم الهاتف' },
                address: { type: 'string', description: 'العنوان' }
            },
            required: ['name', 'phone']
        }
    },
    {
        name: 'updateCustomer',
        description: 'تحديث بيانات عميل موجود',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'رقم العميل' },
                name: { type: 'string', description: 'الاسم الجديد' },
                email: { type: 'string', description: 'البريد الإلكتروني الجديد' },
                phone: { type: 'string', description: 'رقم الهاتف الجديد' },
                address: { type: 'string', description: 'العنوان الجديد' }
            },
            required: ['id']
        }
    },
    {
        name: 'deleteCustomer',
        description: 'حذف عميل من النظام',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'رقم العميل المراد حذفه' }
            },
            required: ['id']
        }
    },
    {
        name: 'getCustomers',
        description: 'عرض جميع العملاء في النظام',
        parameters: {
            type: 'object',
            properties: {
                limit: { type: 'number', description: 'عدد العملاء المراد عرضهم (اختياري)' }
            }
        }
    },
    {
        name: 'searchCustomers',
        description: 'البحث عن عملاء بالاسم أو الهاتف أو البريد',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'نص البحث' }
            },
            required: ['query']
        }
    },
    {
        name: 'getCustomerOrders',
        description: 'عرض جميع طلبات عميل معين',
        parameters: {
            type: 'object',
            properties: {
                customer_id: { type: 'number', description: 'رقم العميل' }
            },
            required: ['customer_id']
        }
    },

    // ========== PRODUCT MANAGEMENT ==========
    {
        name: 'addProduct',
        description: 'إضافة منتج جديد إلى المخزون',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'اسم المنتج' },
                description: { type: 'string', description: 'وصف المنتج' },
                price: { type: 'number', description: 'السعر' },
                stock_quantity: { type: 'number', description: 'الكمية في المخزون' },
                category_id: { type: 'number', description: 'رقم الفئة' }
            },
            required: ['name', 'price', 'stock_quantity']
        }
    },
    {
        name: 'updateProduct',
        description: 'تحديث معلومات منتج موجود',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'رقم المنتج' },
                name: { type: 'string', description: 'الاسم الجديد' },
                description: { type: 'string', description: 'الوصف الجديد' },
                price: { type: 'number', description: 'السعر الجديد' },
                stock_quantity: { type: 'number', description: 'الكمية الجديدة' }
            },
            required: ['id']
        }
    },
    {
        name: 'deleteProduct',
        description: 'حذف منتج من النظام',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'رقم المنتج المراد حذفه' }
            },
            required: ['id']
        }
    },
    {
        name: 'getProducts',
        description: 'عرض جميع المنتجات في المخزون',
        parameters: {
            type: 'object',
            properties: {
                limit: { type: 'number', description: 'عدد المنتجات المراد عرضها (اختياري)' }
            }
        }
    },
    {
        name: 'searchProducts',
        description: 'البحث عن منتجات بالاسم أو الوصف',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'نص البحث' }
            },
            required: ['query']
        }
    },
    {
        name: 'updateStock',
        description: 'تحديث كمية المخزون لمنتج معين (إضافة أو إنقاص)',
        parameters: {
            type: 'object',
            properties: {
                product_id: { type: 'number', description: 'رقم المنتج' },
                quantity: { type: 'number', description: 'الكمية المراد إضافتها (موجب) أو إنقاصها (سالب)' }
            },
            required: ['product_id', 'quantity']
        }
    },
    {
        name: 'getLowStockProducts',
        description: 'عرض المنتجات قليلة المخزون',
        parameters: {
            type: 'object',
            properties: {
                threshold: { type: 'number', description: 'الحد الأدنى للكمية (افتراضياً 10)' }
            }
        }
    },
    {
        name: 'bulkUpdatePrices',
        description: 'تحديث أسعار المنتجات بنسبة مئوية (زيادة أو تخفيض)',
        parameters: {
            type: 'object',
            properties: {
                percentage: { type: 'number', description: 'نسبة التغيير (مثال: 10 للزيادة 10%, -15 للتخفيض 15%)' },
                category_id: { type: 'number', description: 'تطبيق على فئة معينة فقط (اختياري)' }
            },
            required: ['percentage']
        }
    },

    // ========== ORDER MANAGEMENT ==========
    {
        name: 'createOrder',
        description: 'إنشاء طلب جديد لعميل',
        parameters: {
            type: 'object',
            properties: {
                customer_id: { type: 'number', description: 'رقم العميل' },
                items: {
                    type: 'array',
                    description: 'قائمة المنتجات في الطلب',
                    items: {
                        type: 'object',
                        properties: {
                            product_id: { type: 'number', description: 'رقم المنتج' },
                            quantity: { type: 'number', description: 'الكمية' },
                            unit_price: { type: 'number', description: 'سعر الوحدة' }
                        }
                    }
                },
                discount: { type: 'number', description: 'قيمة الخصم' }
            },
            required: ['customer_id', 'items']
        }
    },
    {
        name: 'updateOrder',
        description: 'تحديث حالة أو بيانات طلب موجود',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'رقم الطلب' },
                status: { type: 'string', description: 'حالة الطلب الجديدة (pending, completed, cancelled)' },
                discount: { type: 'number', description: 'تحديث قيمة الخصم' }
            },
            required: ['id']
        }
    },
    {
        name: 'deleteOrder',
        description: 'حذف طلب من النظام',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'رقم الطلب المراد حذفه' }
            },
            required: ['id']
        }
    },
    {
        name: 'getOrders',
        description: 'عرض جميع الطلبات في النظام',
        parameters: {
            type: 'object',
            properties: {
                limit: { type: 'number', description: 'عدد الطلبات المراد عرضها (اختياري)' },
                status: { type: 'string', description: 'فلترة حسب الحالة (اختياري)' }
            }
        }
    },
    {
        name: 'getOrderDetails',
        description: 'عرض تفاصيل طلب معين مع المنتجات',
        parameters: {
            type: 'object',
            properties: {
                order_id: { type: 'number', description: 'رقم الطلب' }
            },
            required: ['order_id']
        }
    },
    {
        name: 'searchOrders',
        description: 'البحث عن طلبات حسب اسم العميل أو رقم الطلب',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'نص البحث' }
            },
            required: ['query']
        }
    },

    // ========== ANALYTICS & REPORTS ==========
    {
        name: 'getDashboardStats',
        description: 'عرض إحصائيات لوحة التحكم (عدد العملاء، المنتجات، الطلبات، الإيرادات)',
        parameters: { type: 'object', properties: {} }
    },
    {
        name: 'getRevenueReport',
        description: 'تقرير الإيرادات حسب فترة زمنية',
        parameters: {
            type: 'object',
            properties: {
                start_date: { type: 'string', description: 'تاريخ البداية (YYYY-MM-DD)' },
                end_date: { type: 'string', description: 'تاريخ النهاية (YYYY-MM-DD)' },
                group_by: { type: 'string', description: 'التجميع حسب (day, month, year)' }
            }
        }
    },
    {
        name: 'getBestSellingProducts',
        description: 'عرض أفضل المنتجات مبيعاً',
        parameters: {
            type: 'object',
            properties: {
                limit: { type: 'number', description: 'عدد المنتجات المراد عرضها (افتراضياً 10)' }
            }
        }
    },
    {
        name: 'getTopCustomers',
        description: 'عرض أفضل العملاء من حيث المشتريات',
        parameters: {
            type: 'object',
            properties: {
                limit: { type: 'number', description: 'عدد العملاء المراد عرضهم (افتراضياً 10)' }
            }
        }
    },

    // ========== SYSTEM OPERATIONS ==========
    {
        name: 'clearAllData',
        description: 'حذف جميع البيانات من النظام (تحذير: عملية خطرة)',
        parameters: {
            type: 'object',
            properties: {
                confirm: { type: 'boolean', description: 'يجب أن يكون true للتأكيد' }
            },
            required: ['confirm']
        }
    },
    {
        name: 'getSystemInfo',
        description: 'عرض معلومات النظام وحجم قاعدة البيانات',
        parameters: { type: 'object', properties: {} }
    }
];

// ========== FUNCTION IMPLEMENTATIONS ==========

async function executeFunction(functionName, args) {
    const database = db;

    switch (functionName) {
        // ========== CUSTOMERS ==========
        case 'addCustomer':
            return new Promise((resolve, reject) => {
                const { name, email, phone, address } = args;
                database.db.run(
                    `INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)`,
                    [name, email || null, phone, address || null],
                    function(err) {
                        if (err) reject(err);
                        else resolve({
                            success: true,
                            id: this.lastID,
                            message: `✅ تم إضافة العميل "${name}" بنجاح برقم #${this.lastID}`
                        });
                    }
                );
            });

        case 'updateCustomer':
            return new Promise((resolve, reject) => {
                const { id, ...updates } = args;
                const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
                const values = [...Object.values(updates), id];

                if (fields.length === 0) {
                    resolve({ success: false, message: '⚠️ لا توجد تحديثات' });
                    return;
                }

                database.db.run(
                    `UPDATE customers SET ${fields} WHERE id = ?`,
                    values,
                    function(err) {
                        if (err) reject(err);
                        else resolve({
                            success: true,
                            changes: this.changes,
                            message: `✅ تم تحديث بيانات العميل #${id}`
                        });
                    }
                );
            });

        case 'deleteCustomer':
            return new Promise((resolve, reject) => {
                database.db.run(`DELETE FROM customers WHERE id = ?`, [args.id], function(err) {
                    if (err) reject(err);
                    else resolve({
                        success: true,
                        changes: this.changes,
                        message: `🗑️ تم حذف العميل #${args.id}`
                    });
                });
            });

        case 'getCustomers':
            return new Promise((resolve, reject) => {
                const limit = args.limit ? `LIMIT ${args.limit}` : '';
                database.db.all(
                    `SELECT * FROM customers ORDER BY id DESC ${limit}`,
                    [],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve({
                            customers: rows,
                            count: rows.length,
                            message: `📋 تم العثور على ${rows.length} عميل`
                        });
                    }
                );
            });

        case 'searchCustomers':
            return new Promise((resolve, reject) => {
                const query = `%${args.query}%`;
                database.db.all(
                    `SELECT * FROM customers
                     WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?
                     ORDER BY id DESC`,
                    [query, query, query],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve({
                            customers: rows,
                            count: rows.length,
                            message: `🔍 تم العثور على ${rows.length} عميل`
                        });
                    }
                );
            });

        case 'getCustomerOrders':
            return new Promise((resolve, reject) => {
                database.db.all(
                    `SELECT o.*, COUNT(oi.id) as items_count
                     FROM orders o
                     LEFT JOIN order_items oi ON o.id = oi.order_id
                     WHERE o.customer_id = ?
                     GROUP BY o.id
                     ORDER BY o.created_at DESC`,
                    [args.customer_id],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve({
                            orders: rows,
                            count: rows.length,
                            message: `📦 العميل لديه ${rows.length} طلب`
                        });
                    }
                );
            });

        // ========== PRODUCTS ==========
        case 'addProduct':
            return new Promise((resolve, reject) => {
                const { name, description, price, stock_quantity, category_id } = args;
                database.db.run(
                    `INSERT INTO products (name, description, price, stock_quantity, category_id)
                     VALUES (?, ?, ?, ?, ?)`,
                    [name, description || null, price, stock_quantity, category_id || null],
                    function(err) {
                        if (err) reject(err);
                        else resolve({
                            success: true,
                            id: this.lastID,
                            message: `✅ تم إضافة المنتج "${name}" بنجاح برقم #${this.lastID}`
                        });
                    }
                );
            });

        case 'updateProduct':
            return new Promise((resolve, reject) => {
                const { id, ...updates } = args;
                const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
                const values = [...Object.values(updates), id];

                if (fields.length === 0) {
                    resolve({ success: false, message: '⚠️ لا توجد تحديثات' });
                    return;
                }

                database.db.run(
                    `UPDATE products SET ${fields} WHERE id = ?`,
                    values,
                    function(err) {
                        if (err) reject(err);
                        else resolve({
                            success: true,
                            changes: this.changes,
                            message: `✅ تم تحديث المنتج #${id}`
                        });
                    }
                );
            });

        case 'deleteProduct':
            return new Promise((resolve, reject) => {
                database.db.run(`DELETE FROM products WHERE id = ?`, [args.id], function(err) {
                    if (err) reject(err);
                    else resolve({
                        success: true,
                        changes: this.changes,
                        message: `🗑️ تم حذف المنتج #${args.id}`
                    });
                });
            });

        case 'getProducts':
            return new Promise((resolve, reject) => {
                const limit = args.limit ? `LIMIT ${args.limit}` : '';
                database.db.all(
                    `SELECT * FROM products ORDER BY id DESC ${limit}`,
                    [],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve({
                            products: rows,
                            count: rows.length,
                            message: `📦 تم العثور على ${rows.length} منتج`
                        });
                    }
                );
            });

        case 'searchProducts':
            return new Promise((resolve, reject) => {
                const query = `%${args.query}%`;
                database.db.all(
                    `SELECT * FROM products
                     WHERE name LIKE ? OR description LIKE ?
                     ORDER BY id DESC`,
                    [query, query],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve({
                            products: rows,
                            count: rows.length,
                            message: `🔍 تم العثور على ${rows.length} منتج`
                        });
                    }
                );
            });

        case 'updateStock':
            return new Promise((resolve, reject) => {
                database.db.run(
                    `UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?`,
                    [args.quantity, args.product_id],
                    function(err) {
                        if (err) reject(err);
                        else {
                            database.db.get(
                                `SELECT name, stock_quantity FROM products WHERE id = ?`,
                                [args.product_id],
                                (err, row) => {
                                    if (err) reject(err);
                                    else resolve({
                                        success: true,
                                        new_quantity: row.stock_quantity,
                                        message: `✅ تم تحديث مخزون "${row.name}" إلى ${row.stock_quantity} وحدة`
                                    });
                                }
                            );
                        }
                    }
                );
            });

        case 'getLowStockProducts':
            return new Promise((resolve, reject) => {
                const threshold = args.threshold || 10;
                database.db.all(
                    `SELECT * FROM products WHERE stock_quantity <= ? ORDER BY stock_quantity ASC`,
                    [threshold],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve({
                            products: rows,
                            count: rows.length,
                            message: `⚠️ يوجد ${rows.length} منتج بكمية أقل من ${threshold}`
                        });
                    }
                );
            });

        case 'bulkUpdatePrices':
            return new Promise((resolve, reject) => {
                const { percentage, category_id } = args;
                const multiplier = 1 + (percentage / 100);
                const categoryFilter = category_id ? `WHERE category_id = ${category_id}` : '';

                database.db.run(
                    `UPDATE products SET price = price * ? ${categoryFilter}`,
                    [multiplier],
                    function(err) {
                        if (err) reject(err);
                        else resolve({
                            success: true,
                            changes: this.changes,
                            message: `✅ تم تحديث ${this.changes} منتج بنسبة ${percentage > 0 ? '+' : ''}${percentage}%`
                        });
                    }
                );
            });

        // ========== ORDERS ==========
        case 'createOrder':
            return new Promise((resolve, reject) => {
                const { customer_id, items, discount = 0 } = args;
                const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
                const final_amount = total_amount - discount;

                database.db.run(
                    `INSERT INTO orders (customer_id, total_amount, discount, final_amount, status)
                     VALUES (?, ?, ?, ?, 'pending')`,
                    [customer_id, total_amount, discount, final_amount],
                    function(err) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const order_id = this.lastID;
                        const stmt = database.db.prepare(
                            `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                             VALUES (?, ?, ?, ?)`
                        );

                        items.forEach(item => {
                            stmt.run([order_id, item.product_id, item.quantity, item.unit_price]);
                            // Update stock
                            database.db.run(
                                `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
                                [item.quantity, item.product_id]
                            );
                        });

                        stmt.finalize();
                        resolve({
                            success: true,
                            order_id,
                            total: final_amount,
                            message: `✅ تم إنشاء الطلب #${order_id} بمبلغ ${final_amount} ريال`
                        });
                    }
                );
            });

        case 'updateOrder':
            return new Promise((resolve, reject) => {
                const { id, ...updates } = args;

                // Recalculate final amount if discount changed
                if (updates.discount !== undefined) {
                    database.db.get(
                        `SELECT total_amount FROM orders WHERE id = ?`,
                        [id],
                        (err, row) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            updates.final_amount = row.total_amount - updates.discount;
                            performUpdate();
                        }
                    );
                } else {
                    performUpdate();
                }

                function performUpdate() {
                    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
                    const values = [...Object.values(updates), id];

                    if (fields.length === 0) {
                        resolve({ success: false, message: '⚠️ لا توجد تحديثات' });
                        return;
                    }

                    database.db.run(
                        `UPDATE orders SET ${fields} WHERE id = ?`,
                        values,
                        function(err) {
                            if (err) reject(err);
                            else resolve({
                                success: true,
                                changes: this.changes,
                                message: `✅ تم تحديث الطلب #${id}`
                            });
                        }
                    );
                }
            });

        case 'deleteOrder':
            return new Promise((resolve, reject) => {
                // First delete order items
                database.db.run(`DELETE FROM order_items WHERE order_id = ?`, [args.id], (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // Then delete order
                    database.db.run(`DELETE FROM orders WHERE id = ?`, [args.id], function(err) {
                        if (err) reject(err);
                        else resolve({
                            success: true,
                            message: `🗑️ تم حذف الطلب #${args.id}`
                        });
                    });
                });
            });

        case 'getOrders':
            return new Promise((resolve, reject) => {
                const limit = args.limit ? `LIMIT ${args.limit}` : '';
                const statusFilter = args.status ? `WHERE o.status = '${args.status}'` : '';

                database.db.all(
                    `SELECT o.*, c.name as customer_name, COUNT(oi.id) as items_count
                     FROM orders o
                     LEFT JOIN customers c ON o.customer_id = c.id
                     LEFT JOIN order_items oi ON o.id = oi.order_id
                     ${statusFilter}
                     GROUP BY o.id
                     ORDER BY o.created_at DESC ${limit}`,
                    [],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve({
                            orders: rows,
                            count: rows.length,
                            message: `📦 تم العثور على ${rows.length} طلب`
                        });
                    }
                );
            });

        case 'getOrderDetails':
            return new Promise((resolve, reject) => {
                database.db.get(
                    `SELECT o.*, c.name as customer_name, c.phone as customer_phone
                     FROM orders o
                     LEFT JOIN customers c ON o.customer_id = c.id
                     WHERE o.id = ?`,
                    [args.order_id],
                    (err, order) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        database.db.all(
                            `SELECT oi.*, p.name as product_name
                             FROM order_items oi
                             LEFT JOIN products p ON oi.product_id = p.id
                             WHERE oi.order_id = ?`,
                            [args.order_id],
                            (err, items) => {
                                if (err) reject(err);
                                else resolve({
                                    order,
                                    items,
                                    message: `📋 تفاصيل الطلب #${args.order_id}`
                                });
                            }
                        );
                    }
                );
            });

        case 'searchOrders':
            return new Promise((resolve, reject) => {
                const query = `%${args.query}%`;
                database.db.all(
                    `SELECT o.*, c.name as customer_name
                     FROM orders o
                     LEFT JOIN customers c ON o.customer_id = c.id
                     WHERE c.name LIKE ? OR o.id LIKE ?
                     ORDER BY o.created_at DESC`,
                    [query, args.query],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve({
                            orders: rows,
                            count: rows.length,
                            message: `🔍 تم العثور على ${rows.length} طلب`
                        });
                    }
                );
            });

        // ========== ANALYTICS ==========
        case 'getDashboardStats':
            return new Promise((resolve, reject) => {
                database.db.all(`
                    SELECT
                        (SELECT COUNT(*) FROM customers) as total_customers,
                        (SELECT COUNT(*) FROM products) as total_products,
                        (SELECT COUNT(*) FROM orders) as total_orders,
                        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
                        (SELECT COUNT(*) FROM orders WHERE status = 'completed') as completed_orders,
                        (SELECT COALESCE(SUM(final_amount), 0) FROM orders) as total_revenue,
                        (SELECT COALESCE(SUM(final_amount), 0) FROM orders WHERE status = 'completed') as completed_revenue,
                        (SELECT COUNT(*) FROM products WHERE stock_quantity <= 10) as low_stock_products
                `, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve({
                        stats: rows[0],
                        message: `📊 إحصائيات النظام`
                    });
                });
            });

        case 'getRevenueReport':
            return new Promise((resolve, reject) => {
                const { start_date, end_date, group_by = 'day' } = args;
                const dateFormat = group_by === 'month' ? '%Y-%m' : group_by === 'year' ? '%Y' : '%Y-%m-%d';

                let query = `
                    SELECT
                        strftime('${dateFormat}', created_at) as period,
                        COUNT(*) as orders_count,
                        SUM(final_amount) as revenue
                    FROM orders
                `;

                const conditions = [];
                const params = [];

                if (start_date) {
                    conditions.push('created_at >= ?');
                    params.push(start_date);
                }
                if (end_date) {
                    conditions.push('created_at <= ?');
                    params.push(end_date);
                }

                if (conditions.length > 0) {
                    query += ' WHERE ' + conditions.join(' AND ');
                }

                query += ' GROUP BY period ORDER BY period DESC';

                database.db.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else {
                        const total = rows.reduce((sum, row) => sum + (row.revenue || 0), 0);
                        resolve({
                            report: rows,
                            total_revenue: total,
                            message: `📈 تقرير الإيرادات: ${total} ريال`
                        });
                    }
                });
            });

        case 'getBestSellingProducts':
            return new Promise((resolve, reject) => {
                const limit = args.limit || 10;
                database.db.all(
                    `SELECT
                        p.id, p.name, p.price,
                        COUNT(oi.id) as orders_count,
                        SUM(oi.quantity) as total_sold,
                        SUM(oi.quantity * oi.unit_price) as total_revenue
                     FROM products p
                     INNER JOIN order_items oi ON p.id = oi.product_id
                     GROUP BY p.id
                     ORDER BY total_sold DESC
                     LIMIT ?`,
                    [limit],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve({
                            products: rows,
                            message: `🏆 أفضل ${rows.length} منتج مبيعاً`
                        });
                    }
                );
            });

        case 'getTopCustomers':
            return new Promise((resolve, reject) => {
                const limit = args.limit || 10;
                database.db.all(
                    `SELECT
                        c.id, c.name, c.phone, c.email,
                        COUNT(o.id) as orders_count,
                        SUM(o.final_amount) as total_spent
                     FROM customers c
                     INNER JOIN orders o ON c.id = o.customer_id
                     GROUP BY c.id
                     ORDER BY total_spent DESC
                     LIMIT ?`,
                    [limit],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve({
                            customers: rows,
                            message: `🌟 أفضل ${rows.length} عميل`
                        });
                    }
                );
            });

        // ========== SYSTEM ==========
        case 'clearAllData':
            return new Promise((resolve, reject) => {
                if (!args.confirm) {
                    resolve({
                        success: false,
                        message: '⚠️ يجب التأكيد لحذف جميع البيانات. هذه العملية لا يمكن التراجع عنها!'
                    });
                    return;
                }

                database.db.serialize(() => {
                    database.db.run(`DELETE FROM order_items`);
                    database.db.run(`DELETE FROM orders`);
                    database.db.run(`DELETE FROM products`);
                    database.db.run(`DELETE FROM customers`, (err) => {
                        if (err) reject(err);
                        else resolve({
                            success: true,
                            message: `🗑️ تم حذف جميع البيانات من النظام`
                        });
                    });
                });
            });

        case 'getSystemInfo':
            return new Promise((resolve, reject) => {
                const fs = require('fs');
                const path = require('path');

                database.db.all(`
                    SELECT
                        (SELECT COUNT(*) FROM customers) as customers,
                        (SELECT COUNT(*) FROM products) as products,
                        (SELECT COUNT(*) FROM orders) as orders,
                        (SELECT COUNT(*) FROM order_items) as order_items
                `, [], (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const dbPath = path.join(__dirname, '../data/sales.db');
                    let dbSize = 0;
                    try {
                        const stats = fs.statSync(dbPath);
                        dbSize = (stats.size / 1024).toFixed(2); // KB
                    } catch (e) {
                        dbSize = 'Unknown';
                    }

                    resolve({
                        database_records: rows[0],
                        database_size: `${dbSize} KB`,
                        node_version: process.version,
                        uptime: process.uptime(),
                        message: `💾 معلومات النظام`
                    });
                });
            });

        default:
            return { error: 'Unknown function', message: '❌ وظيفة غير معروفة' };
    }
}

// ========== ENHANCED AI CHAT FUNCTION ==========

async function chat(message, conversationHistory = []) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',  // 🔥 UPGRADED TO 2.5 FLASH
            tools: [{
                functionDeclarations: tools
            }],
            systemInstruction: `أنت مساعد AI متقدم لنظام إدارة المبيعات - لديك سيطرة كاملة على النظام بالكامل! 🚀

🎯 **صلاحياتك الكاملة:**
- إدارة العملاء: إضافة، تعديل، حذف، بحث
- إدارة المنتجات: إضافة، تعديل، حذف، بحث، تحديث المخزون، تحديث الأسعار
- إدارة الطلبات: إنشاء، تعديل، حذف، بحث، عرض التفاصيل
- التقارير والإحصائيات: إيرادات، أفضل المنتجات، أفضل العملاء
- عمليات النظام: مسح البيانات، عرض معلومات النظام

💡 **إرشادات مهمة:**
1. تحدث باللغة العربية دائماً
2. كن ودوداً ومحترفاً في ردودك
3. استخدم الإيموجي لتوضيح الرسائل
4. عند الطلب، استخدم الأدوات المتاحة فوراً
5. اشرح ما فعلته بوضوح
6. إذا كانت العملية خطرة (حذف)، حذر المستخدم
7. قدم اقتراحات مفيدة بعد كل عملية
8. عند البحث، اعرض النتائج بشكل منظم

🔒 **التأكيدات الأمنية:**
- للعمليات الخطرة (مثل clearAllData)، اطلب تأكيد صريح
- تحقق من المعاملات المالية قبل الحفظ
- نبه عند انخفاض المخزون

📊 **عرض البيانات:**
- رتب المعلومات بشكل جميل
- استخدم الأرقام والإحصائيات
- قدم رؤى وملاحظات مفيدة

أنت الآن جاهز للسيطرة الكاملة على النظام! 💪`
        });

        // Build chat with history
        const chat = model.startChat({
            history: conversationHistory
        });

        // Send user message
        let result = await chat.sendMessage(message);
        let response = result.response;

        // Handle function calls with advanced logic
        const functionCalls = response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            const functionResults = [];

            // Execute all function calls
            for (const call of functionCalls) {
                try {
                    console.log(`🔧 Executing: ${call.name}`, call.args);
                    const functionResult = await executeFunction(call.name, call.args);
                    functionResults.push({
                        functionResponse: {
                            name: call.name,
                            response: functionResult
                        }
                    });
                } catch (error) {
                    console.error(`❌ Function error (${call.name}):`, error);
                    functionResults.push({
                        functionResponse: {
                            name: call.name,
                            response: {
                                error: error.message,
                                message: `❌ حدث خطأ: ${error.message}`
                            }
                        }
                    });
                }
            }

            // Send function results back to model for natural response
            result = await chat.sendMessage(functionResults);
            response = result.response;
        }

        return {
            text: response.text(),
            conversationHistory: await chat.getHistory()
        };

    } catch (error) {
        console.error('AI Error:', error);
        return {
            text: `❌ عذراً، حدث خطأ في النظام: ${error.message}`,
            error: true
        };
    }
}

module.exports = { chat, tools };
