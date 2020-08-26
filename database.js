const mysql = require('mysql2');
const connection = mysql.createPool({
    host     : 'localhost', // MYSQL HOST NAME
    user     : '', // MYSQL USERNAME
    password : '', // MYSQL PASSWORD
    database : '' // MYSQL DB NAME
}).promise();
module.exports = connection;
