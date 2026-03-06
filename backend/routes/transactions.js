const express = require('express');
const router = express.Router();
const {
  transferMoney,
  depositMoney,
  getTransactionHistory,
  getTransactionById
} = require('../controllers/transactionController');

router.post('/transfer', transferMoney);
router.post('/deposit', depositMoney);
router.get('/upi/:upi_id', getTransactionHistory);
router.get("/id/:id", getTransactionById);

module.exports = router;
