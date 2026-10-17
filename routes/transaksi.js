const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. GET: Ambil 20 Riwayat Transaksi Terbaru
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.*, b.nama_barang, b.kode_barang 
            FROM transaksi_stok t
            JOIN barang b ON t.barang_id = b.id
            ORDER BY t.created_at DESC
            LIMIT 20
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. POST: Transaksi Stok (MASUK / KELUAR) dengan Database Transaction
router.post('/', async (req, res) => {
    const { barang_id, tipe, jumlah, keterangan } = req.body;

    if (!barang_id || !tipe || !jumlah) {
        return res.status(400).json({ success: false, message: 'Data transaksi tidak lengkap' });
    }

    if (!['MASUK', 'KELUAR'].includes(tipe)) {
        return res.status(400).json({ success: false, message: 'Tipe transaksi harus MASUK atau KELUAR' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Cek stok jika transaksi KELUAR
        if (tipe === 'KELUAR') {
            const [rows] = await connection.query('SELECT stok_saat_ini FROM barang WHERE id = ?', [barang_id]);
            if (rows.length === 0) {
                throw new Error('Barang tidak ditemukan');
            }
            if (rows[0].stok_saat_ini < jumlah) {
                throw new Error(`Stok tidak mencukupi (Sisa stok: ${rows[0].stok_saat_ini})`);
            }
        }

        // 2. Catat Log Transaksi
        await connection.query(
            'INSERT INTO transaksi_stok (barang_id, tipe, jumlah, keterangan) VALUES (?, ?, ?, ?)',
            [barang_id, tipe, jumlah, keterangan || '']
        );

        // 3. Update Stok di Tabel Master
        const operator = tipe === 'MASUK' ? '+' : '-';
        await connection.query(
            `UPDATE barang SET stok_saat_ini = stok_saat_ini ${operator} ? WHERE id = ?`,
            [jumlah, barang_id]
        );

        await connection.commit();
        res.json({ success: true, message: `Transaksi ${tipe} berhasil diproses` });

    } catch (err) {
        await connection.rollback();
        res.status(400).json({ success: false, error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;