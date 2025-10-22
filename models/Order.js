const db = require('../config/database');

class Order {
  static async getAll() {
    return await db.all(`
      SELECT o.*, c.name as customer_name, u.full_name as created_by_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.created_by = u.id
      ORDER BY o.created_at DESC
    `);
  }

  static async getById(id) {
    const order = await db.get(`
      SELECT o.*, c.name as customer_name, c.email as customer_email,
             c.phone as customer_phone, u.full_name as created_by_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.created_by = u.id
      WHERE o.id = ?
    `, [id]);

    if (order) {
      order.items = await db.all(`
        SELECT oi.*, p.name as product_name, p.sku
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [id]);
    }

    return order;
  }

  static async create(orderData, userId) {
    const { customer_id, items, discount, tax, payment_method, notes } = orderData;

    // حساب المجموع
    let total = 0;
    for (const item of items) {
      total += item.quantity * item.unit_price - (item.discount || 0);
    }

    const finalAmount = total - (discount || 0) + (tax || 0);

    // إنشاء الطلب
    const result = await db.run(
      `INSERT INTO orders (customer_id, total_amount, discount, tax, final_amount, payment_method, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_id, total, discount || 0, tax || 0, finalAmount, payment_method, notes, userId]
    );

    const orderId = result.id;

    // إضافة عناصر الطلب
    for (const item of items) {
      const subtotal = item.quantity * item.unit_price - (item.discount || 0);
      await db.run(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.unit_price, item.discount || 0, subtotal]
      );

      // تحديث المخزون
      const product = await db.get('SELECT stock_quantity FROM products WHERE id = ?', [item.product_id]);
      const newStock = product.stock_quantity - item.quantity;
      await db.run('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, item.product_id]);

      // تسجيل حركة المخزون
      await db.run(
        `INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [item.product_id, 'out', item.quantity, 'order', orderId, userId]
      );
    }

    return orderId;
  }

  static async updateStatus(id, status) {
    await db.run(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    return await this.getById(id);
  }

  static async updatePaymentStatus(id, paymentStatus) {
    await db.run(
      'UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [paymentStatus, id]
    );
    return await this.getById(id);
  }

  static async delete(id) {
    // حذف عناصر الطلب
    await db.run('DELETE FROM order_items WHERE order_id = ?', [id]);
    // حذف الطلب
    await db.run('DELETE FROM orders WHERE id = ?', [id]);
    return { message: 'تم حذف الطلب بنجاح' };
  }

  static async getByCustomer(customerId) {
    return await db.all(`
      SELECT o.*, c.name as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `, [customerId]);
  }

  static async getStatistics() {
    const stats = {};

    // إجمالي المبيعات
    const totalSales = await db.get('SELECT SUM(final_amount) as total FROM orders WHERE payment_status = "paid"');
    stats.totalSales = totalSales.total || 0;

    // عدد الطلبات
    const orderCount = await db.get('SELECT COUNT(*) as count FROM orders');
    stats.orderCount = orderCount.count || 0;

    // الطلبات المعلقة
    const pendingOrders = await db.get('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
    stats.pendingOrders = pendingOrders.count || 0;

    return stats;
  }
}

module.exports = Order;
