// Core modules
const path = require('path');

// Dependency modules
const express = require('express');

// Custom modules
const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
  const items = adminData.items;
  //res.sendFile(path.join(rootDir, 'views', 'shop.html'));
  res.render('shop', {
    productList: items,
    pageTitle: 'Shop Title',
    path: '/',
    hasProducts: items.length > 0,
    activeShop: true,
    productCSS: true
  });
});

module.exports = router;