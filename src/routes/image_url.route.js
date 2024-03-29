const { Router } = require('express');

const { createImageUrl, getImagesByArticle, setImageUrl } = require('../controllers/image_url.controller');

const router = Router();

router.post('/createimageurl', createImageUrl);
router.get('/getimages/:articleid', getImagesByArticle);
router.post('/setimage', setImageUrl);

module.exports = router;