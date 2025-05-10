const express = require('express');
const router = express.Router();
const medicamentoController = require('../controllers/medicamentoController');
const { verifyToken, isAdmin, isModeratorOrAdmin } = require('../middlewares/authJwt');

// Get all Medicamentos - accessible by all authenticated users
router.get('/', verifyToken, medicamentoController.findAll);

// Get a single Medicamento - accessible by all authenticated users
router.get('/:id', verifyToken, medicamentoController.findOne);

// Create a new Medicamento - accessible by moderators and admins
router.post('/', [verifyToken, isModeratorOrAdmin], medicamentoController.create);

// Update a Medicamento - accessible by admins only
router.put('/:id', [verifyToken, isAdmin], medicamentoController.update);

// Delete a Medicamento - accessible by admins only
router.delete('/:id', [verifyToken, isAdmin], medicamentoController.delete);

module.exports = router;
