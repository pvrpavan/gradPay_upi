const express = require('express');
const router = express.Router();
const {
  transferMoney,
  depositMoney,
  payUtilityBill,
  getTransactionHistory,
  getTransactionById
} = require('../controllers/transactionController');

router.post('/transfer', transferMoney);
router.post('/deposit', depositMoney);
router.post('/utility', payUtilityBill);
router.get('/upi/:upi_id', getTransactionHistory);
router.get("/id/:id", getTransactionById);

module.exports = router;
