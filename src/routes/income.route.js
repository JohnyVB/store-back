const { Router } = require('express');
const { createIncome, getAllIncomes, getIncomesByUser, setStatusIncome, createIncomeDetail, getIncomeDetailByIncome } = require('../controllers/income.controller');

const router = Router();

router.post('/createincome', createIncome);
router.get('/getallincomes', getAllIncomes);
router.get('/getincomesbyuser/:userid', getIncomesByUser);
router.post('/statusincome', setStatusIncome);
router.post('/createincomedetail', createIncomeDetail);
router.get('/getincomedetail/:incomeid', getIncomeDetailByIncome);


module.exports = router;