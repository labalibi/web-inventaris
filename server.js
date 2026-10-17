const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Routes
const barangRoutes = require('./routes/barang');
const transaksiRoutes = require('./routes/transaksi');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan File Statis (Frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Routing API
app.use('/api/barang', barangRoutes);
app.use('/api/transaksi', transaksiRoutes);

// Handling 404 API (Diubah menjadi '/api' agar kompatibel dengan versi Express terbaru)
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint API tidak ditemukan'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Error Server:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server internal',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('==================================================');
    console.log(`🚀 Server Inventaris berjalan di port ${PORT}`);
    console.log(`🌐 Website Frontend : http://localhost:${PORT}`);
    console.log(`🔗 API Barang       : http://localhost:${PORT}/api/barang`);
    console.log(`🔗 API Transaksi    : http://localhost:${PORT}/api/transaksi`);
    console.log('==================================================');
});