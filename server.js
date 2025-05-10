const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database configuration
const { sequelize, testConnection } = require('./config/database');
const models = require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const tipoMedicRoutes = require('./routes/tipoMedicRoutes');
const medicamentoRoutes = require('./routes/medicamentoRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tipo-medic', tipoMedicRoutes);
app.use('/api/medicamentos', medicamentoRoutes);

// Serve the main HTML page for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

// Set port and start server
const PORT = process.env.PORT || 3000;

// Sync database models
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models (force: true will drop tables if they exist)
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully');
    
    // Create some default users for testing
    const { User } = models;
    await User.create({
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      role: 'administrador'
    });
    
    await User.create({
      username: 'moderator',
      password: 'mod123',
      email: 'mod@example.com',
      role: 'moderador'
    });
    
    await User.create({
      username: 'user',
      password: 'user123',
      email: 'user@example.com',
      role: 'usuario'
    });
    
    console.log('Default users created successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
