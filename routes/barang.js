const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. GET: Ambil Semua Barang beserta Nama Kategori
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT b.*, k.nama_kategori 
            FROM barang b 
            LEFT JOIN kategori k ON b.kategori_id = k.id 
            ORDER BY b.created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. POST: Tambah Barang Baru
router.post('/', async (req, res) => {
    const { 
        kode_barang, nama_barang, kategori_id, 
        stok_saat_ini, satuan, stok_minimum, 
        lokasi_penyimpanan, package_footprint, datasheet_url 
    } = req.body;

    try {
        const [result] = await db.query(
            `INSERT INTO barang 
            (kode_barang, nama_barang, kategori_id, stok_saat_ini, satuan, stok_minimum, lokasi_penyimpanan, package_footprint, datasheet_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                kode_barang, 
                nama_barang, 
                kategori_id || null, 
                stok_saat_ini || 0, 
                satuan || 'pcs', 
                stok_minimum || 5, 
                lokasi_penyimpanan || null, 
                package_footprint || null, 
                datasheet_url || null
            ]
        );
        res.status(201).json({ success: true, message: 'Barang berhasil ditambahkan', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. PUT: Update Data Barang Lengkap
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        kode_barang, nama_barang, kategori_id, 
        stok_minimum, lokasi_penyimpanan, 
        package_footprint, datasheet_url 
    } = req.body;

    try {
        await db.query(
            `UPDATE barang SET 
                kode_barang = ?, 
                nama_barang = ?, 
                kategori_id = ?, 
                stok_minimum = ?, 
                lokasi_penyimpanan = ?, 
                package_footprint = ?, 
                datasheet_url = ? 
            WHERE id = ?`,
            [
                kode_barang, 
                nama_barang, 
                kategori_id || null, 
                stok_minimum || 5, 
                lokasi_penyimpanan || null, 
                package_footprint || null, 
                datasheet_url || null, 
                id
            ]
        );
        res.json({ success: true, message: 'Data barang berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 4. DELETE: Hapus Barang
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM barang WHERE id = ?', [id]);
        res.json({ success: true, message: 'Barang berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;