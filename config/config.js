const { Sequelize } = require('sequelize');
require('dotenv').config(); // Carga las variables de entorno

// Configuración de Sequelize
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false // Puedes habilitar el logging si necesitas ver las consultas SQL
});

module.exports = sequelize;