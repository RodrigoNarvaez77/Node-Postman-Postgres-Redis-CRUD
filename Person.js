//requiere conectarse a express.
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sequelize = require('./config/config');
//requiere archivo Index.js donde se definio person y works.
const Person = require('./models/Index');
const redis = require('redis');
require('dotenv').config(); // Carga las variables de entorno
const redisClient = require('./redis/redisClient');
//ejecuta funcion express.
const app = express();
//ejecuta consulta en el puerto 3002.
const port = 3002;
app.use(bodyParser.json());//toma el json y lo transforma en un objeto javascript
//ruta del archivo
app.use('/api/persons',require('./PersonRoutes'));

// Index.html
app.use(express.json()); // Para analizar json en el cuerpo de la solicitud
app.use(express.static(path.join(__dirname, './index'))); // servir archivos estáticos desde la carpeta `index`

// Conecta la base de datos y arranca el servidor
sequelize.sync()
  .then(() => {
    console.log('Base de datos Conectada');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Base de datos no se conecto:', err);
  });




