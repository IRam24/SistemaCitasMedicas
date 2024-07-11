const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',  
  user: 'root',
  password: 'root1',
  database: 'isidroayora',
  port: 3306
});

module.exports = pool;