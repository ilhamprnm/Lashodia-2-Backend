const express = require('express');
const { signIn, signUp } = require('../controllers/authController');
const router = express.Router();

router.post('/login', signIn);
router.post('/signup', signUp);

module.exports = router;