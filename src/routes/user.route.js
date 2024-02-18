const { Router } = require('express');

const { test } = require('../controllers/user.controller');
const { getCategories } = require('../controllers/category.controller');

const router = Router();

router.get('/test', test);
router.get('/category', getCategories);

module.exports = router;