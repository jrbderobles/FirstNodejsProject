// Dependency modules
const express = require('express');

// Custom modules
const productsController = require('../controllers/products');

const router = express.Router();

router.get('/', productsController.getProducts);

module.exports = router;