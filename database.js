const mysql = require('mysql2');
const connection = mysql.createPool({
    host     : 'localhost', // MYSQL HOST NAME
    user     : 'root', // MYSQL USERNAME
    password : 'Sahil!@#123', // MYSQL PASSWORD
    database : 'searchbar' // MYSQL DB NAME
}).promise();
module.exports = connection;