// Core modules
const path = require('path');

// Dependency modules
const express = require('express');

// Custom modules
const rootDir = require('../util/path');

const items = [];
const router = express.Router();

router.get('/add-product', (req, res, next) => {
  res.render('add-product', {pageTitle: 'Add Product', path: '/admin/add-product'});
});

router.post('/add-product', (req, res, next) => {
  items.push({title: req.body.title});
  res.redirect('/');
});


exports.routes = router;
exports.items = items;