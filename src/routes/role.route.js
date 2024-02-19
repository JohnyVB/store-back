const { Router } = require('express');

const {
    createRole,
    getRoles,
    setRole,
    changeStatusRole
} = require('../controllers/role.controller');

const router = Router();

router.post('/createrole', createRole)
router.get('/getroles', getRoles)
router.post('/setrole', setRole)
router.post('/statusrole', changeStatusRole)

module.exports = router;