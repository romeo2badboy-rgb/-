const db = require('../config/database');

class Invoice {
  static async getAll() {
    return await db.all(`
      SELECT i.*, c.name as customer_name, o.order_date
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN orders o ON i.order_id = o.id
      ORDER BY i.created_at DESC
    `);
  }

  static async getById(id) {
    const invoice = await db.get(`
      SELECT i.*, c.name as customer_name, c.email as customer_email,
             c.phone as customer_phone, c.address as customer_address,
             o.order_date
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN orders o ON i.order_id = o.id
      WHERE i.id = ?
    `, [id]);

    if (invoice) {
      // الحصول على عناصر الطلب
      invoice.items = await db.all(`
        SELECT oi.*, p.name as product_name, p.sku
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [invoice.order_id]);

      // الحصول على المدفوعات
      invoice.payments = await db.all(`
        SELECT p.*, u.full_name as created_by_name
        FROM payments p
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.invoice_id = ?
        ORDER BY p.payment_date DESC
      `, [id]);
    }

    return invoice;
  }

  static async create(invoiceData, userId) {
    const { order_id, customer_id, due_date, notes } = invoiceData;

    // الحصول على معلومات الطلب
    const order = await db.get('SELECT final_amount FROM orders WHERE id = ?', [order_id]);

    // إنشاء رقم الفاتورة
    const invoiceNumber = `INV-${Date.now()}`;

    const result = await db.run(
      `INSERT INTO invoices (invoice_number, order_id, customer_id, due_date, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [invoiceNumber, order_id, customer_id, due_date, order.final_amount, notes]
    );

    return result.id;
  }

  static async updateStatus(id, status) {
    await db.run(
      'UPDATE invoices SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    return await this.getById(id);
  }

  static async addPayment(invoiceId, paymentData, userId) {
    const { amount, payment_method, reference_number, notes } = paymentData;

    // إضافة الدفعة
    await db.run(
      `INSERT INTO payments (invoice_id, amount, payment_method, reference_number, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [invoiceId, amount, payment_method, reference_number, notes, userId]
    );

    // تحديث المبلغ المدفوع
    const invoice = await db.get('SELECT paid_amount, total_amount FROM invoices WHERE id = ?', [invoiceId]);
    const newPaidAmount = (invoice.paid_amount || 0) + amount;

    let status = 'partial';
    if (newPaidAmount >= invoice.total_amount) {
      status = 'paid';
    }

    await db.run(
      'UPDATE invoices SET paid_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPaidAmount, status, invoiceId]
    );

    return await this.getById(invoiceId);
  }

  static async delete(id) {
    await db.run('DELETE FROM invoices WHERE id = ?', [id]);
    return { message: 'تم حذف الفاتورة بنجاح' };
  }

  static async getByCustomer(customerId) {
    return await db.all(`
      SELECT i.*, c.name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.customer_id = ?
      ORDER BY i.created_at DESC
    `, [customerId]);
  }
}

module.exports = Invoice;
