const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDgRQ4rATcxVXOjUUS18UjsweGoLEGMSyQ');

// Define AI tools for controlling the website
const tools = [
    {
        name: 'addCustomer',
        description: 'Add a new customer to the database',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Customer full name' },
                email: { type: 'string', description: 'Customer email address' },
                phone: { type: 'string', description: 'Customer phone number' },
                address: { type: 'string', description: 'Customer address' }
            },
            required: ['name', 'phone']
        }
    },
    {
        name: 'addProduct',
        description: 'Add a new product to the inventory',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Product name' },
                description: { type: 'string', description: 'Product description' },
                price: { type: 'number', description: 'Product price' },
                stock_quantity: { type: 'number', description: 'Stock quantity' },
                category_id: { type: 'number', description: 'Category ID' }
            },
            required: ['name', 'price', 'stock_quantity']
        }
    },
    {
        name: 'createOrder',
        description: 'Create a new order for a customer',
        parameters: {
            type: 'object',
            properties: {
                customer_id: { type: 'number', description: 'Customer ID' },
                items: {
                    type: 'array',
                    description: 'Order items',
                    items: {
                        type: 'object',
                        properties: {
                            product_id: { type: 'number' },
                            quantity: { type: 'number' },
                            unit_price: { type: 'number' }
                        }
                    }
                },
                discount: { type: 'number', description: 'Discount amount' }
            },
            required: ['customer_id', 'items']
        }
    },
    {
        name: 'getCustomers',
        description: 'Get list of all customers',
        parameters: { type: 'object', properties: {} }
    },
    {
        name: 'getProducts',
        description: 'Get list of all products',
        parameters: { type: 'object', properties: {} }
    },
    {
        name: 'getOrders',
        description: 'Get list of all orders',
        parameters: { type: 'object', properties: {} }
    },
    {
        name: 'getDashboardStats',
        description: 'Get dashboard statistics',
        parameters: { type: 'object', properties: {} }
    },
    {
        name: 'updateProduct',
        description: 'Update product information',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'Product ID' },
                name: { type: 'string' },
                price: { type: 'number' },
                stock_quantity: { type: 'number' }
            },
            required: ['id']
        }
    },
    {
        name: 'deleteCustomer',
        description: 'Delete a customer',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'Customer ID' }
            },
            required: ['id']
        }
    },
    {
        name: 'deleteProduct',
        description: 'Delete a product',
        parameters: {
            type: 'object',
            properties: {
                id: { type: 'number', description: 'Product ID' }
            },
            required: ['id']
        }
    }
];

// Function implementations
async function executeFunction(functionName, args) {
    const database = db;

    switch (functionName) {
        case 'addCustomer':
            return new Promise((resolve, reject) => {
                const { name, email, phone, address } = args;
                database.db.run(
                    `INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)`,
                    [name, email || null, phone, address || null],
                    function(err) {
                        if (err) reject(err);
                        else resolve({ success: true, id: this.lastID, message: `تم إضافة العميل ${name} بنجاح` });
                    }
                );
            });

        case 'addProduct':
            return new Promise((resolve, reject) => {
                const { name, description, price, stock_quantity, category_id } = args;
                database.db.run(
                    `INSERT INTO products (name, description, price, stock_quantity, category_id) VALUES (?, ?, ?, ?, ?)`,
                    [name, description || null, price, stock_quantity, category_id || null],
                    function(err) {
                        if (err) reject(err);
                        else resolve({ success: true, id: this.lastID, message: `تم إضافة المنتج ${name} بنجاح` });
                    }
                );
            });

        case 'createOrder':
            return new Promise((resolve, reject) => {
                const { customer_id, items, discount = 0 } = args;
                const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
                const final_amount = total_amount - discount;

                database.db.run(
                    `INSERT INTO orders (customer_id, total_amount, discount, final_amount) VALUES (?, ?, ?, ?)`,
                    [customer_id, total_amount, discount, final_amount],
                    function(err) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const order_id = this.lastID;
                        const stmt = database.db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`);

                        items.forEach(item => {
                            stmt.run([order_id, item.product_id, item.quantity, item.unit_price]);
                        });

                        stmt.finalize();
                        resolve({ success: true, order_id, message: `تم إنشاء الطلب رقم ${order_id} بنجاح` });
                    }
                );
            });

        case 'getCustomers':
            return new Promise((resolve, reject) => {
                database.db.all(`SELECT * FROM customers ORDER BY id DESC`, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve({ customers: rows });
                });
            });

        case 'getProducts':
            return new Promise((resolve, reject) => {
                database.db.all(`SELECT * FROM products ORDER BY id DESC`, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve({ products: rows });
                });
            });

        case 'getOrders':
            return new Promise((resolve, reject) => {
                database.db.all(
                    `SELECT o.*, c.name as customer_name FROM orders o
                     LEFT JOIN customers c ON o.customer_id = c.id
                     ORDER BY o.id DESC`,
                    [],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve({ orders: rows });
                    }
                );
            });

        case 'getDashboardStats':
            return new Promise((resolve, reject) => {
                database.db.all(`
                    SELECT
                        (SELECT COUNT(*) FROM customers) as total_customers,
                        (SELECT COUNT(*) FROM products) as total_products,
                        (SELECT COUNT(*) FROM orders) as total_orders,
                        (SELECT COALESCE(SUM(final_amount), 0) FROM orders) as total_revenue
                `, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows[0]);
                });
            });

        case 'updateProduct':
            return new Promise((resolve, reject) => {
                const { id, ...updates } = args;
                const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
                const values = [...Object.values(updates), id];

                if (fields.length === 0) {
                    resolve({ success: false, message: 'لا توجد تحديثات' });
                    return;
                }

                database.db.run(
                    `UPDATE products SET ${fields} WHERE id = ?`,
                    values,
                    function(err) {
                        if (err) reject(err);
                        else resolve({ success: true, message: `تم تحديث المنتج رقم ${id}` });
                    }
                );
            });

        case 'deleteCustomer':
            return new Promise((resolve, reject) => {
                database.db.run(`DELETE FROM customers WHERE id = ?`, [args.id], function(err) {
                    if (err) reject(err);
                    else resolve({ success: true, message: `تم حذف العميل رقم ${args.id}` });
                });
            });

        case 'deleteProduct':
            return new Promise((resolve, reject) => {
                database.db.run(`DELETE FROM products WHERE id = ?`, [args.id], function(err) {
                    if (err) reject(err);
                    else resolve({ success: true, message: `تم حذف المنتج رقم ${args.id}` });
                });
            });

        default:
            return { error: 'Unknown function' };
    }
}

// Main AI chat function
async function chat(message, conversationHistory = []) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            tools: [{
                functionDeclarations: tools
            }],
            systemInstruction: `أنت مساعد AI ذكي لنظام إدارة المبيعات.
            يمكنك التحكم بالنظام بالكامل: إضافة وتعديل وحذف العملاء، المنتجات، والطلبات.
            تحدث باللغة العربية دائماً.
            عندما يطلب المستخدم إضافة أو تعديل شيء، استخدم الأدوات المتاحة لك.
            كن ودوداً ومحترفاً في ردودك.
            إذا لم تفهم الطلب، اسأل للتوضيح.`
        });

        // Build chat history
        const chat = model.startChat({
            history: conversationHistory
        });

        // Send message
        let result = await chat.sendMessage(message);
        let response = result.response;

        // Handle function calls
        const functionCalls = response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            const functionResults = [];

            for (const call of functionCalls) {
                try {
                    const functionResult = await executeFunction(call.name, call.args);
                    functionResults.push({
                        functionResponse: {
                            name: call.name,
                            response: functionResult
                        }
                    });
                } catch (error) {
                    functionResults.push({
                        functionResponse: {
                            name: call.name,
                            response: { error: error.message }
                        }
                    });
                }
            }

            // Send function results back to model
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
            text: `عذراً، حدث خطأ: ${error.message}`,
            error: true
        };
    }
}

module.exports = { chat, tools };
