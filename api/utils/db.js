import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      connectionLimit: 10
    });

    this.checkConnection();
  }

  async checkConnection() {
    try {
      const connection = await this.pool.getConnection();
      console.log('Successfully connected to the database');
      connection.release();
    } catch (err) {
      console.error('Error connecting to the database:', err);
    }
  }

  query(sql, params) {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, params, (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  getConnection() {
    return this.pool.getConnection();
  }
}

const db = new Database();
export default db;
