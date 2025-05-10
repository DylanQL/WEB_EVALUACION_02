const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authJwt');

// Routes for authentication
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout', verifyToken, authController.signout);

module.exports = router;
