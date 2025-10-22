const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = {};

    // إحصائيات المبيعات
    const salesStats = await db.get(`
      SELECT
        COUNT(*) as total_orders,
        SUM(final_amount) as total_revenue,
        SUM(CASE WHEN payment_status = 'paid' THEN final_amount ELSE 0 END) as paid_revenue,
        SUM(CASE WHEN payment_status = 'unpaid' THEN final_amount ELSE 0 END) as unpaid_revenue
      FROM orders
    `);
    stats.sales = salesStats;

    // عدد العملاء
    const customerCount = await db.get('SELECT COUNT(*) as count FROM customers');
    stats.customers = customerCount.count;

    // عدد المنتجات
    const productCount = await db.get('SELECT COUNT(*) as count FROM products');
    stats.products = productCount.count;

    // المنتجات منخفضة المخزون
    const lowStockCount = await db.get(`
      SELECT COUNT(*) as count FROM products
      WHERE stock_quantity <= min_stock_level
    `);
    stats.lowStockProducts = lowStockCount.count;

    // الفواتير المعلقة
    const pendingInvoices = await db.get(`
      SELECT COUNT(*) as count, SUM(total_amount - paid_amount) as amount
      FROM invoices WHERE status != 'paid'
    `);
    stats.pendingInvoices = pendingInvoices;

    // أفضل المنتجات مبيعاً
    const topProducts = await db.all(`
      SELECT p.name, p.sku, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY oi.product_id
      ORDER BY total_sold DESC
      LIMIT 5
    `);
    stats.topProducts = topProducts;

    // أفضل العملاء
    const topCustomers = await db.all(`
      SELECT c.name, c.email, COUNT(o.id) as order_count, SUM(o.final_amount) as total_spent
      FROM customers c
      JOIN orders o ON c.id = o.customer_id
      GROUP BY c.id
      ORDER BY total_spent DESC
      LIMIT 5
    `);
    stats.topCustomers = topCustomers;

    // مبيعات آخر 7 أيام
    const last7Days = await db.all(`
      SELECT DATE(order_date) as date, COUNT(*) as orders, SUM(final_amount) as revenue
      FROM orders
      WHERE order_date >= DATE('now', '-7 days')
      GROUP BY DATE(order_date)
      ORDER BY date
    `);
    stats.last7Days = last7Days;

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT
        o.id, o.order_date, o.final_amount, o.status, o.payment_status,
        c.name as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;

    const params = [];
    if (start_date) {
      query += ' AND DATE(o.order_date) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND DATE(o.order_date) <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY o.order_date DESC';

    const orders = await db.all(query, params);

    // حساب المجاميع
    const totals = orders.reduce((acc, order) => {
      acc.totalRevenue += order.final_amount;
      if (order.payment_status === 'paid') {
        acc.paidRevenue += order.final_amount;
      }
      return acc;
    }, { totalRevenue: 0, paidRevenue: 0 });

    res.json({
      success: true,
      data: {
        orders,
        totals,
        count: orders.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const products = await db.all(`
      SELECT
        p.*,
        c.name as category_name,
        (p.stock_quantity * p.cost) as inventory_value,
        CASE
          WHEN p.stock_quantity <= p.min_stock_level THEN 'low'
          WHEN p.stock_quantity = 0 THEN 'out'
          ELSE 'ok'
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.stock_quantity ASC
    `);

    // حساب قيمة المخزون الإجمالية
    const totalValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.cost), 0);

    res.json({
      success: true,
      data: {
        products,
        totalValue,
        count: products.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomerReport = async (req, res) => {
  try {
    const customers = await db.all(`
      SELECT
        c.*,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.final_amount), 0) as total_spent,
        MAX(o.order_date) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      GROUP BY c.id
      ORDER BY total_spent DESC
    `);

    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfitReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT
        o.id,
        o.order_date,
        o.final_amount as revenue,
        SUM(oi.quantity * p.cost) as cost,
        (o.final_amount - SUM(oi.quantity * p.cost)) as profit,
        c.name as customer_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.payment_status = 'paid'
    `;

    const params = [];
    if (start_date) {
      query += ' AND DATE(o.order_date) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND DATE(o.order_date) <= ?';
      params.push(end_date);
    }

    query += ' GROUP BY o.id ORDER BY o.order_date DESC';

    const orders = await db.all(query, params);

    // حساب المجاميع
    const totals = orders.reduce((acc, order) => {
      acc.totalRevenue += order.revenue;
      acc.totalCost += order.cost;
      acc.totalProfit += order.profit;
      return acc;
    }, { totalRevenue: 0, totalCost: 0, totalProfit: 0 });

    totals.profitMargin = totals.totalRevenue > 0
      ? ((totals.totalProfit / totals.totalRevenue) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        orders,
        totals,
        count: orders.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
