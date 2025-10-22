const db = require('../config/database');

class Category {
  static async getAll() {
    return await db.all('SELECT * FROM categories ORDER BY name');
  }

  static async getById(id) {
    return await db.get('SELECT * FROM categories WHERE id = ?', [id]);
  }

  static async create(category) {
    const { name, description } = category;
    const result = await db.run(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.id;
  }

  static async update(id, category) {
    const { name, description } = category;
    await db.run(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    return await this.getById(id);
  }

  static async delete(id) {
    await db.run('DELETE FROM categories WHERE id = ?', [id]);
    return { message: 'تم حذف الفئة بنجاح' };
  }
}

module.exports = Category;
