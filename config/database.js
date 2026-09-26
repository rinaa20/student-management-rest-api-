const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_ms'
});

const db = connection.promise();

module.exports = db; 