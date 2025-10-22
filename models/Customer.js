const db = require('../config/database');

class Customer {
  static async getAll() {
    return await db.all('SELECT * FROM customers ORDER BY created_at DESC');
  }

  static async getById(id) {
    return await db.get('SELECT * FROM customers WHERE id = ?', [id]);
  }

  static async create(customer) {
    const { name, email, phone, address, city, country, notes } = customer;
    const result = await db.run(
      'INSERT INTO customers (name, email, phone, address, city, country, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, address, city, country, notes]
    );
    return result.id;
  }

  static async update(id, customer) {
    const { name, email, phone, address, city, country, notes } = customer;
    await db.run(
      `UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, city = ?, country = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name, email, phone, address, city, country, notes, id]
    );
    return await this.getById(id);
  }

  static async delete(id) {
    await db.run('DELETE FROM customers WHERE id = ?', [id]);
    return { message: 'تم حذف العميل بنجاح' };
  }

  static async search(query) {
    return await db.all(
      `SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
  }
}

module.exports = Customer;
