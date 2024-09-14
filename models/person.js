const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Person = sequelize.define('personas' ,{
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING,
        field:'name'
    },
    lastname:{ 
        allowNull:false,
        type: DataTypes.STRING,
        field: 'lastname'
    },
    nationality:{
        allowNull: true,
        type: DataTypes.STRING,
        field: 'nationality'
    },

    year:{
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'year'
    }

    },{
        tableName: 'personas', // Nombre de la tabla en la base de datos
        timestamps: false // Desactiva los campos createdAt y updatedAt
    });

module.exports = Person;
