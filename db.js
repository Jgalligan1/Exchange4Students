// db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Voyager@Beyond', // your MySQL password
  database: 'project1' // your database name
});

module.exports = pool;
