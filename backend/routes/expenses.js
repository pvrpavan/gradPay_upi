// routes/tracker.js
const express = require("express");
const router = express.Router();
const {
  addExpense,
  getExpensesByUpi,
  getCategoryWiseStats
} = require("../controllers/trackerController");

router.post("/", addExpense); // Add new expense
router.get("/:upi_id", getExpensesByUpi); // All expenses for UPI ID
router.get("/stats/:upi_id", getCategoryWiseStats); // Category-wise summary

module.exports = router;
