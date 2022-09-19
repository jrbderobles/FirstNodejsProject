// Dependency modules
const express = require('express');

// Custom modules
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);

module.exports = router;