const { TipoMedic } = require('../models');

// Create a new TipoMedic
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.CodTipoMed || !req.body.descripcion) {
      return res.status(400).send({ message: 'Code and description are required!' });
    }

    // Create a new TipoMedic
    const tipoMedic = await TipoMedic.create({
      CodTipoMed: req.body.CodTipoMed,
      descripcion: req.body.descripcion
    });

    return res.status(201).send(tipoMedic);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({ message: 'Medication type code already exists!' });
    }
    return res.status(500).send({ message: error.message || 'Some error occurred while creating the Medication Type.' });
  }
};

// Get all TipoMedic records
exports.findAll = async (req, res) => {
  try {
    const tipoMedics = await TipoMedic.findAll();
    return res.status(200).send(tipoMedics);
  } catch (error) {
    return res.status(500).send({ message: error.message || 'Some error occurred while retrieving Medication Types.' });
  }
};

// Find a single TipoMedic by ID
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const tipoMedic = await TipoMedic.findByPk(id);
    if (!tipoMedic) {
      return res.status(404).send({ message: `Medication Type with code ${id} not found!` });
    }
    return res.status(200).send(tipoMedic);
  } catch (error) {
    return res.status(500).send({ message: error.message || `Error retrieving Medication Type with code ${id}` });
  }
};

// Update a TipoMedic
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    const [num] = await TipoMedic.update(req.body, {
      where: { CodTipoMed: id }
    });
    
    if (num === 1) {
      return res.status(200).send({ message: 'Medication Type was updated successfully.' });
    } else {
      return res.status(404).send({ message: `Cannot update Medication Type with code ${id}. Maybe it was not found!` });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message || `Error updating Medication Type with code ${id}` });
  }
};

// Delete a TipoMedic
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const num = await TipoMedic.destroy({
      where: { CodTipoMed: id }
    });
    
    if (num === 1) {
      return res.status(200).send({ message: 'Medication Type was deleted successfully!' });
    } else {
      return res.status(404).send({ message: `Cannot delete Medication Type with code ${id}. Maybe it was not found!` });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message || `Could not delete Medication Type with code ${id}` });
  }
};
