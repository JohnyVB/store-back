const { Router } = require('express');

const { createUser, getUsers, setUser, changeStatusUser } = require('../controllers/user.controller');

const router = Router();

router.post('/createuser', createUser);
router.get('/getusers', getUsers);
router.post('/setuser', setUser);
router.post('/statususer', changeStatusUser);

module.exports = router;