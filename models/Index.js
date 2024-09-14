const sequelize = require('../config/config');
const Person = require('./person');
const Work = require('./works');
console.log(Person);
console.log(Work);
//console.log(sequelize);

// Definir asociaciones
Person.belongsToMany(Work, { through: 'people_works' });//person define que una persona puede estar asociada a muchos trabajos
Work.belongsToMany(Person, { through: 'people_works' });//work tambien puede estar asociado con muchas instancias del modelo Person,

// Sincronizar la base de datos
sequelize.sync()
    .then(() => console.log('Base de datos y tablas creadas'))
    .catch(err => console.error('Error al crear tablas y base de datos:', err));

module.exports = { sequelize, Person, Work };


