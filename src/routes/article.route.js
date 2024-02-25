const { Router } = require('express');

const { createArticle, gerAllArticles, getArticlesByCategory, setArticle, setStatusArticle } = require('../controllers/article.controller');

const router = Router();

router.post('/createarticle', createArticle);
router.get('/getallarticles', gerAllArticles);
router.get('/getarticlesbycategory/:categoryid', getArticlesByCategory);
router.post('/setarticle/:article_id', setArticle);
router.post('/statusarticle', setStatusArticle);

module.exports = router;