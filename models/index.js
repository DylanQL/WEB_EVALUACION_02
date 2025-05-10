const User = require('./User');
const TipoMedic = require('./TipoMedic');
const Medicamento = require('./Medicamento');

// Define relationships
TipoMedic.hasMany(Medicamento, { foreignKey: 'CodTipoMed' });
Medicamento.belongsTo(TipoMedic, { foreignKey: 'CodTipoMed' });

module.exports = {
  User,
  TipoMedic,
  Medicamento
};
