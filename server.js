const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'locatex'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

app.post('/report', upload.single('itemImage'), (req, res) => {
    const { itemType, itemName, itemDescription, itemLocation, userEmail } = req.body;
    const itemImage = req.file.buffer;

    const sql = 'INSERT INTO reports (itemType, itemName, itemDescription, itemLocation, userEmail, itemImage) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [itemType, itemName, itemDescription, itemLocation, userEmail, itemImage], (err, result) => {
        if (err) throw err;
        res.send('Report submitted successfully');
    });
});

app.get('/search', (req, res) => {
    const { keyword, date, category } = req.query;

    let sql = 'SELECT * FROM reports WHERE 1=1';
    const params = [];

    if (keyword) {
        sql += ' AND (itemName LIKE ? OR itemDescription LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (date) {
        sql += ' AND DATE(created_at) = ?';
        params.push(date);
    }

    if (category) {
        sql += ' AND itemType = ?';
        params.push(category);
    }

    db.query(sql, params, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});