// Core modules
const path = require('path');

// Dependency modules
const express = require('express');

// Custom modules
const rootDir = require('../util/path');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;