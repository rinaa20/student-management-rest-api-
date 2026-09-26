const express = require('express');
const app = express();
const db = require('./config/database');
const bcrypt = require('bcrypt'); // Opsional, bisa dihapus jika tidak dipakai
const cors = require('cors');

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET: Ambil semua data siswa (Tanpa token)
app.get('/api/siswa', async (req, res)=>{
    try{
        const sql = 'SELECT * FROM siswa';
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error){
        console.error('Error retrieving siswa:', error);
        res.status(500).json({status: false, message: "Terjadi kesalahan"});
    }
});

// GET: Ambil data siswa berdasarkan ID (Tanpa token)
app.get('/api/siswa/:id', async (req, res)=>{
    const siswaId = req.params.id;
    try{
        const sql = 'SELECT * FROM siswa WHERE id=?';
        const [rows] = await db.query(sql, [siswaId]);
        if (rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Siswa tidak ditemukan' });
        }
        res.json(rows[0]);
    } catch (error){
        console.error(error);
        res.status(500).json({status: false, message: "Terjadi kesalahan"});
    }
});

// POST: Tambah data siswa baru (Tanpa token)
app.post('/api/siswa', async (req, res)=>{
    const { nis, nama, kelas, jurusan, alamat } = req.body;
    let errors = [];

    if (!nis || String(nis).trim() === '') {
        errors.push("NIS tidak boleh kosong");
    }
    if (!nama || String(nama).trim() === '') {
        errors.push("Nama tidak boleh kosong");
    }
    if (!kelas || String(kelas).trim() === '') {
        errors.push("Kelas tidak boleh kosong");
    }
    if (!jurusan || String(jurusan).trim() === '') {
        errors.push("Jurusan tidak boleh kosong");
    }
    if (!alamat || String(alamat).trim() === '') {
        errors.push("Alamat tidak boleh kosong");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            status: false,
            messages: errors 
        });
    }

    try{
        const sql = 'INSERT INTO siswa (nis, nama, kelas, jurusan, alamat) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [nis, nama, kelas, jurusan, alamat]);
        
        res.status(201).json({
            status: true, 
            message: "Data berhasil ditambahkan",
            data: { id: result.insertId, nis, nama, kelas, jurusan, alamat }
        });
     } catch (error){
        console.log(error);
        res.status(500).json({
            status: false, 
            message: 'Terjadi kesalahan', 
            error: error.message
        });
    }
});

// PUT: Update data siswa berdasarkan ID (Tanpa token)
app.put('/api/siswa/:id', async (req, res)=>{
    try {
        const siswaId = req.params.id;
        const {nis, nama, kelas, jurusan, alamat} = req.body;
        let errors = [];

        if (!nis || String(nis).trim() === '') {
            errors.push("NIS tidak boleh kosong");
        }
        if (!nama || String(nama).trim() === '') {
            errors.push("Nama tidak boleh kosong");
        }

        if (errors.length > 0){
            return res.status(400).json({
                status: false,
                messages: errors 
            });
        }

        // DIPERBAIKI: Menambahkan 'WHERE id=?' agar data lain tidak ikut ter-update
        let sql = 'UPDATE siswa SET nis=?, nama=?, kelas=?, jurusan=?, alamat=? WHERE id=?';
        let queryParams = [nis, nama, kelas, jurusan, alamat, siswaId];

        const [result] = await db.query(sql, queryParams);

        if(result.affectedRows === 0){
            return res.status(404).json({ status: false, message: "Siswa tidak ditemukan" });
        }

        res.status(200).json({
            status: true, 
            message: "Data berhasil diupdate"
        });

    } catch (error){
        console.log(error);
        res.status(500).json({
            status: false, 
            message: 'Terjadi kesalahan', 
            error: error.message
        });
    }
});

// DELETE: Hapus siswa berdasarkan ID (Tanpa token)
app.delete('/api/siswa/:id', async (req, res)=>{
    try{
        const siswaId = req.params.id; // Diperbaiki dari userId agar konsisten
        const sql = 'DELETE FROM siswa WHERE id=?';
        const [result] = await db.query(sql, [siswaId]); // Diperbaiki agar menggunakan siswaId

        if(result.affectedRows === 0){
            return res.status(404).json({
                status: false, 
                message: "Siswa tidak ditemukan"
            });
        }
        
        res.status(200).json({
            status: true, 
            message: "Data berhasil dihapus"
        });
    } catch (error){
        console.log(error);
        res.status(500).json({
            status: false, 
            message: "Terjadi kesalahan"
        });
    }
});

// POST: Login sederhana menggunakan NIS dan Nama (Tanpa token)
app.post('/login', async (req, res)=> {
    const {nis, nama} = req.body;
    if (!nis || !nama){
        return res.status(400).json({
            status: false,
            message: 'NIS dan Nama wajib diisi'
        });
    }
    try{
        // Mencocokkan nis dan nama sekaligus di database
        const sql = 'SELECT * FROM siswa WHERE nis = ? AND nama = ?';
        const [rows] = await db.query(sql, [nis, nama]);

        if (rows.length === 0){
            return res.status(401).json({
                status: false, 
                message: 'NIS atau Nama salah'
            });
        }
        const siswa = rows[0];

        res.status(200).json({
            status: true,
            message: 'Login Berhasil',
            data: {
                id: siswa.id,
                nis: siswa.nis,
                nama: siswa.nama,
                kelas: siswa.kelas,
                jurusan: siswa.jurusan
            }
        });
    } catch (error){
        console.error(error);
        res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
});

app.listen(3000, ()=>{
    console.log('server berjalan di http://localhost:3000');
});