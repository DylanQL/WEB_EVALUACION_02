const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TipoMedic = sequelize.define('TipoMedic', {
  CodTipoMed: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'TipoMedic',
});

module.exports = TipoMedic;
