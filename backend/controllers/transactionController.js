// controllers/transactionController.js
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// POST /api/transactions/send
exports.transferMoney = async (req, res) => {
  try {
    const { sender_upi, receiver_upi, amount, note } = req.body;

    if (!sender_upi || !receiver_upi || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid transaction data" });
    }

    const sender = await User.findOne({ upi_id: sender_upi });
    const receiver = await User.findOne({ upi_id: receiver_upi });

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Sender or receiver not found" });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Update balances
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    // Save two transaction records: one debit, one credit
    const debitTransaction = new Transaction({
      sender_upi,
      receiver_upi,
      amount,
      type: "debit",
      note: note || "Money sent",
    });

    const creditTransaction = new Transaction({
      sender_upi,
      receiver_upi,
      amount,
      type: "credit",
      note: note || "Money received",
    });

    await debitTransaction.save();
    await creditTransaction.save();

    res.status(200).json({
      message: "Transaction successful",
      debitTransaction,
      creditTransaction,
    });
  } catch (err) {
    console.error("Send Money Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const { upi_id } = req.params;
    const { type, from, to, page = 1, limit = 10 } = req.query;

    const query = {
      $or: [{ sender_upi: upi_id }, { receiver_upi: upi_id }],
    };

    // Filter by type
    if (type === "credit" || type === "debit") {
      query.type = type;
    }

    // Filter by date range
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      transactions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error("Get Transactions Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    res.status(500).json({ message: "Error fetching transaction" });
  }
};





























// // controllers/transactionController.js
// const User = require("../models/User");
// const Transaction = require("../models/Transaction");

// // POST /api/transactions/send
// exports.transferMoney = async (req, res) => {
//   try {
//     const { sender_upi, receiver_upi, amount, note } = req.body;

//     if (!sender_upi || !receiver_upi || !amount || amount <= 0) {
//       return res.status(400).json({ message: "Invalid transaction data" });
//     }

//     // Find sender and receiver
//     const sender = await User.findOne({ upi_id: sender_upi });
//     const receiver = await User.findOne({ upi_id: receiver_upi });

//     if (!sender || !receiver) {
//       return res.status(404).json({ message: "Sender or receiver not found" });
//     }

//     // Check sender balance
//     if (sender.balance < amount) {
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     // Deduct from sender, add to receiver
//     sender.balance -= amount;
//     receiver.balance += amount;
//     await sender.save();
//     await receiver.save();

//     // Log transaction (single record with type: "debit")
//     const transaction = new Transaction({
//       sender_upi,
//       receiver_upi,
//       amount,
//       type: "debit",
//       note: note || "Money sent",
//     });
//     await transaction.save();

//     res.status(200).json({
//       message: "Transaction successful",
//       transaction,
//     });
//   } catch (err) {
//     console.error("Send Money Error:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // GET /api/transactions/:upi_id
// exports.getTransactionHistory = async (req, res) => {
//   try {
//     const { upi_id } = req.params;

//     const transactions = await Transaction.find({
//       $or: [{ sender_upi: upi_id }, { receiver_upi: upi_id }],
//     }).sort({ timestamp: -1 });

//     res.status(200).json(transactions);
//   } catch (err) {
//     console.error("Get Transactions Error:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
