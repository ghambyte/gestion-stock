const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/utilisateurs', require('./routes/utilisateurs'));
app.use('/api/boutiques', require('./routes/boutiques'));
app.use('/api/boutiques/:boutiqueId/categories', require('./routes/categories'));
app.use('/api/boutiques/:boutiqueId/produits', require('./routes/produits'));
app.use('/api/boutiques/:boutiqueId/clients', require('./routes/clients'));
app.use('/api/boutiques/:boutiqueId/ventes', require('./routes/ventes'));
app.use('/api/boutiques/:boutiqueId/paiements', require('./routes/paiements'));
app.use('/api/boutiques/:boutiqueId/tableau-de-bord', require('./routes/tableauDeBord'));
app.use('/api/admin', require('./routes/admin'));

// Route de sante
app.get('/api/sante', (req, res) => {
  res.json({ succes: true, message: 'KALIS API fonctionne correctement' });
});

// Servir le frontend statique en production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend-v2/build');
  app.use(express.static(frontendPath));
  app.get('{*splat}', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ succes: false, message: 'Route non trouvee' });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err.message);
  res.status(err.status || 500).json({
    succes: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne du serveur',
  });
});

module.exports = app;
