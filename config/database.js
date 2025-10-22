const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/sales.db');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      // إنشاء المجلد إذا لم يكن موجوداً
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) {
        try {
          fs.mkdirSync(dbDir, { recursive: true });
          console.log('تم إنشاء مجلد قاعدة البيانات:', dbDir);
        } catch (mkdirErr) {
          console.error('خطأ في إنشاء مجلد قاعدة البيانات:', mkdirErr.message);
          reject(mkdirErr);
          return;
        }
      }

      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('خطأ في الاتصال بقاعدة البيانات:', err.message);
          reject(err);
        } else {
          console.log('تم الاتصال بقاعدة البيانات بنجاح');
          resolve(this.db);
        }
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('تم إغلاق الاتصال بقاعدة البيانات');
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();
