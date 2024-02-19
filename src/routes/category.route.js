const { Router } = require('express');

const {
    createCategory,
    getCategories,
    setCategory,
    changeStatusCategory
} = require('../controllers/category.controller');

const router = Router();

router.post('/createcategory', createCategory);
router.get('/getcategories', getCategories);
router.post('/setcategory', setCategory);
router.post('/statuscategory', changeStatusCategory);

module.exports = router;