const express = require('express');
const router = express.Router();
const tipoMedicController = require('../controllers/tipoMedicController');
const { verifyToken, isAdmin, isModeratorOrAdmin } = require('../middlewares/authJwt');

// Get all TipoMedics - accessible by all authenticated users
router.get('/', verifyToken, tipoMedicController.findAll);

// Get a single TipoMedic - accessible by all authenticated users
router.get('/:id', verifyToken, tipoMedicController.findOne);

// Create a new TipoMedic - accessible by moderators and admins
router.post('/', [verifyToken, isModeratorOrAdmin], tipoMedicController.create);

// Update a TipoMedic - accessible by admins only
router.put('/:id', [verifyToken, isAdmin], tipoMedicController.update);

// Delete a TipoMedic - accessible by admins only
router.delete('/:id', [verifyToken, isAdmin], tipoMedicController.delete);

module.exports = router;
