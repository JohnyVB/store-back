const { Router } = require('express');

const { login, checkToken } = require('../controllers/auth.controller');

const router = Router();

router.post('/login', login);
router.post('/checktoken', checkToken);

module.exports = router;