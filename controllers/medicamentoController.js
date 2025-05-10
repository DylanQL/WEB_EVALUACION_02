const { Medicamento, TipoMedic } = require('../models');

// Create a new Medicamento
exports.create = async (req, res) => {
  try {
    // Validate request
    const requiredFields = [
      'CodMedicamento', 'descripcionMed', 'fechaFabricacion', 
      'fechaVencimiento', 'presentacion', 'stock', 'precioVentaUni', 
      'precioVentaPres', 'marca', 'CodTipoMed'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).send({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Check if TipoMedic exists
    const tipoMedic = await TipoMedic.findByPk(req.body.CodTipoMed);
    if (!tipoMedic) {
      return res.status(400).send({ 
        message: `Medication Type with code ${req.body.CodTipoMed} does not exist` 
      });
    }

    // Create a new Medicamento
    const medicamento = await Medicamento.create(req.body);

    return res.status(201).send(medicamento);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({ message: 'Medication code already exists!' });
    }
    return res.status(500).send({ 
      message: error.message || 'Some error occurred while creating the Medication.' 
    });
  }
};

// Get all Medicamentos
exports.findAll = async (req, res) => {
  try {
    const medicamentos = await Medicamento.findAll({
      include: [{
        model: TipoMedic,
        attributes: ['descripcion']
      }]
    });
    return res.status(200).send(medicamentos);
  } catch (error) {
    return res.status(500).send({ 
      message: error.message || 'Some error occurred while retrieving Medications.' 
    });
  }
};

// Find a single Medicamento by ID
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const medicamento = await Medicamento.findByPk(id, {
      include: [{
        model: TipoMedic,
        attributes: ['descripcion']
      }]
    });
    
    if (!medicamento) {
      return res.status(404).send({ message: `Medication with code ${id} not found!` });
    }
    
    return res.status(200).send(medicamento);
  } catch (error) {
    return res.status(500).send({ 
      message: error.message || `Error retrieving Medication with code ${id}` 
    });
  }
};

// Update a Medicamento
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    // Check if TipoMedic exists if it's being updated
    if (req.body.CodTipoMed) {
      const tipoMedic = await TipoMedic.findByPk(req.body.CodTipoMed);
      if (!tipoMedic) {
        return res.status(400).send({ 
          message: `Medication Type with code ${req.body.CodTipoMed} does not exist` 
        });
      }
    }

    const [num] = await Medicamento.update(req.body, {
      where: { CodMedicamento: id }
    });
    
    if (num === 1) {
      return res.status(200).send({ message: 'Medication was updated successfully.' });
    } else {
      return res.status(404).send({ 
        message: `Cannot update Medication with code ${id}. Maybe it was not found!` 
      });
    }
  } catch (error) {
    return res.status(500).send({ 
      message: error.message || `Error updating Medication with code ${id}` 
    });
  }
};

// Delete a Medicamento
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const num = await Medicamento.destroy({
      where: { CodMedicamento: id }
    });
    
    if (num === 1) {
      return res.status(200).send({ message: 'Medication was deleted successfully!' });
    } else {
      return res.status(404).send({ 
        message: `Cannot delete Medication with code ${id}. Maybe it was not found!` 
      });
    }
  } catch (error) {
    return res.status(500).send({ 
      message: error.message || `Could not delete Medication with code ${id}` 
    });
  }
};
