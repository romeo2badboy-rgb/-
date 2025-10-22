const db = require('../config/database');

class Product {
  static async getAll() {
    return await db.all(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
  }

  static async getById(id) {
    return await db.get(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
  }

  static async create(product) {
    const { name, description, category_id, price, cost, sku, barcode, stock_quantity, min_stock_level, image_url } = product;
    const result = await db.run(
      `INSERT INTO products (name, description, category_id, price, cost, sku, barcode, stock_quantity, min_stock_level, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, category_id, price, cost, sku, barcode, stock_quantity || 0, min_stock_level || 0, image_url]
    );
    return result.id;
  }

  static async update(id, product) {
    const { name, description, category_id, price, cost, sku, barcode, stock_quantity, min_stock_level, image_url } = product;
    await db.run(
      `UPDATE products SET name = ?, description = ?, category_id = ?, price = ?, cost = ?, sku = ?, barcode = ?,
       stock_quantity = ?, min_stock_level = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name, description, category_id, price, cost, sku, barcode, stock_quantity, min_stock_level, image_url, id]
    );
    return await this.getById(id);
  }

  static async delete(id) {
    await db.run('DELETE FROM products WHERE id = ?', [id]);
    return { message: 'تم حذف المنتج بنجاح' };
  }

  static async updateStock(id, quantity) {
    await db.run(
      'UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, id]
    );
    return await this.getById(id);
  }

  static async getLowStock() {
    return await db.all(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_quantity <= p.min_stock_level
    `);
  }

  static async search(query) {
    return await db.all(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
  }
}

module.exports = Product;
