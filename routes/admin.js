// Core modules
const path = require('path');

// Dependency modules
const express = require('express');

// Custom modules
const rootDir = require('../util/path');

const router = express.Router();

router.get('/add-item', (req, res, next) => {
  res.sendFile(path.join(rootDir, 'views', 'add-item.html'));
});

router.post('/add-item', (req, res, next) => {
  console.log(req.body);
  res.redirect('/');
});


module.exports = router;