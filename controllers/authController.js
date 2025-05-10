const jwt = require('jsonwebtoken');
const { User } = require('../models');

// User registration
exports.signup = async (req, res) => {
  try {
    // Validate request
    if (!req.body.username || !req.body.password || !req.body.email) {
      return res.status(400).send({ message: 'Username, password and email are required!' });
    }

    // Create a new user
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'usuario'  // Default role is 'usuario' if not specified
    });

    return res.status(201).send({ 
      message: 'User registered successfully!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({ message: 'Username or email already exists!' });
    }
    return res.status(500).send({ message: error.message || 'Some error occurred while creating the user.' });
  }
};

// User login
exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: req.body.username } });

    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    const passwordIsValid = await user.validPassword(req.body.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Invalid password!' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    return res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      accessToken: token
    });
  } catch (error) {
    return res.status(500).send({ message: error.message || 'Some error occurred during login.' });
  }
};

// User logout (Just for frontend purposes, as JWT is stateless)
exports.signout = async (req, res) => {
  try {
    // In a real-world app, you might want to blacklist the token
    // For now, just send a successful response
    return res.status(200).send({ message: 'You have been signed out!' });
  } catch (error) {
    return res.status(500).send({ message: error.message || 'Some error occurred during logout.' });
  }
};
