// controllers/transactionController.js
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// POST /api/transactions/transfer
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

    // Save a SINGLE transaction record (not two!) to prevent duplicates
    const transaction = new Transaction({
      sender_upi,
      receiver_upi,
      amount,
      type: "transfer",
      note: note || "Money sent",
    });

    await transaction.save();

    // Add reward points for transaction
    sender.rewardPoints = (sender.rewardPoints || 0) + Math.floor(amount / 100);
    await sender.save();

    res.status(200).json({
      message: "Transaction successful",
      transaction,
    });
  } catch (err) {
    console.error("Send Money Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Deposit money - accepts both phone and upi_id
exports.depositMoney = async (req, res) => {
  try {
    const { phone, upi_id, amount } = req.body;

    if ((!phone && !upi_id) || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid deposit data" });
    }

    let user;
    if (upi_id) {
      user = await User.findOne({ upi_id: upi_id });
    }
    if (!user && phone) {
      user = await User.findOne({ phone });
    }
    if (!user) return res.status(404).json({ message: "User not found" });

    user.balance += amount;
    await user.save();

    const userUpiId = Array.isArray(user.upi_id) ? user.upi_id[0] : user.upi_id;

    const transaction = new Transaction({
      sender_upi: "BANK_DEPOSIT",
      receiver_upi: userUpiId,
      amount,
      type: "deposit",
      note: "Wallet deposit",
    });

    await transaction.save();

    console.log(`Deposit: ${user.phone} deposited Rs.${amount}`);

    res.status(200).json({
      message: "Deposit successful",
      balance: user.balance,
      transaction,
    });
  } catch (err) {
    console.error("Deposit Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Utility bill payment
exports.payUtilityBill = async (req, res) => {
  try {
    const { phone, utilityType, amount, billNumber } = req.body;

    if (!phone || !utilityType || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid utility payment data" });
    }

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.balance -= amount;
    await user.save();

    const userUpiId = Array.isArray(user.upi_id) ? user.upi_id[0] : user.upi_id;

    const transaction = new Transaction({
      sender_upi: userUpiId,
      receiver_upi: `${utilityType.toUpperCase()}_BILL`,
      amount,
      type: "transfer",
      note: `${utilityType} bill payment${billNumber ? ` - ${billNumber}` : ""}`,
    });

    await transaction.save();

    // Add reward points
    user.rewardPoints = (user.rewardPoints || 0) + Math.floor(amount / 50);
    await user.save();

    console.log(`Utility: ${user.phone} paid Rs.${amount} for ${utilityType}`);

    res.status(200).json({
      message: "Bill payment successful",
      balance: user.balance,
      transaction,
    });
  } catch (err) {
    console.error("Utility Payment Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const { upi_id } = req.params;
    const { type, from, to, page = 1, limit = 20 } = req.query;

    // Find transactions where user is sender OR receiver (single record per tx)
    const query = {
      $or: [{ sender_upi: upi_id }, { receiver_upi: upi_id }],
    };

    // Filter by type
    if (type === "sent") {
      query.$or = undefined;
      query.sender_upi = upi_id;
      query.type = "transfer";
    } else if (type === "received") {
      query.$or = undefined;
      query.receiver_upi = upi_id;
      query.type = "transfer";
    } else if (type === "deposit") {
      query.$or = undefined;
      query.receiver_upi = upi_id;
      query.type = "deposit";
    }
    // "all" keeps the default $or

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

    // Enrich with user details
    const sender = await User.findOne({ upi_id: transaction.sender_upi });
    const receiver = await User.findOne({ upi_id: transaction.receiver_upi });

    res.status(200).json({
      ...transaction.toObject(),
      senderName: sender?.displayName || transaction.sender_upi,
      receiverName: receiver?.displayName || transaction.receiver_upi,
      senderPhone: sender?.phone || "",
      receiverPhone: receiver?.phone || "",
    });
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    res.status(500).json({ message: "Error fetching transaction" });
  }
};
