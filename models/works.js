const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Work = sequelize.define('work', {
    company: {
        type: DataTypes.STRING,
        allowNull: false
    },
    initContract: {
        type: DataTypes.DATE,
        allowNull: false
    },
    finishContract: {
        type: DataTypes.DATE,
        allowNull: false
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false
    }
    },{
        tableName: 'work', // Nombre de la tabla en la base de datos
        timestamps: false // Desactiva los campos createdAt y updatedAt
    });

module.exports = Work;