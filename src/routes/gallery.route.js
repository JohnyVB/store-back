const { Router } = require('express');

const { createImageGallery, getImagesGallery, setImageGallery, setPositionImageGallery, deleteImageGallery } = require('../controllers/gallery.controller');

const router = Router();

router.post('/createimagegallery', createImageGallery);
router.get('/getimagesgallery', getImagesGallery);
router.post('/setimagegallery', setImageGallery);
router.post('/setpositionimagegallery', setPositionImageGallery);
router.post('/deleteimagegallery', deleteImageGallery);

module.exports = router;