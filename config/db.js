const mysql = require('mysql2/promise');
require('dotenv').config();

// Membuat connection pool untuk database MySQL / TiDB Cloud
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'db_inventaris',
    ssl: {
        rejectUnauthorized: false // Wajib untuk enkripsi TLS/SSL di TiDB Cloud
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Fungsi penguji koneksi saat server pertama kali dijalankan
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Koneksi database (TiDB Cloud/MySQL) berhasil terhubung!');
        connection.release();
    } catch (error) {
        console.error('❌ Gagal terhubung ke database:', error.message);
    }
})();

module.exports = db;