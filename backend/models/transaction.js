const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  sender_upi: { type: String, required: true },
  receiver_upi: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["debit", "credit", "transfer", "deposit"], required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
});

module.exports = mongoose.model("Transaction", transactionSchema);
