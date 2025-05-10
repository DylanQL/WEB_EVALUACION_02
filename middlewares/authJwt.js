const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    });
  }

  // Remove Bearer from string if present
  const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

  jwt.verify(tokenString, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Unauthorized!'
      });
    }
    req.userId = decoded.id;
    next();
  });
};

// Check if user is Administrator
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user.role === 'administrador') {
      next();
      return;
    }
    return res.status(403).send({
      message: 'Require Administrator Role!'
    });
  } catch (error) {
    return res.status(500).send({
      message: 'Unable to validate User role!'
    });
  }
};

// Check if user is Moderator or Administrator
const isModeratorOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user.role === 'moderador' || user.role === 'administrador') {
      next();
      return;
    }
    return res.status(403).send({
      message: 'Require Moderator or Administrator Role!'
    });
  } catch (error) {
    return res.status(500).send({
      message: 'Unable to validate User role!'
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isModeratorOrAdmin
};
