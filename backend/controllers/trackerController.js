const Expense = require("../models/Expense");

// POST /api/tracker/
exports.addExpense = async (req, res) => {
  try {
    const { upi_id, category, amount, date } = req.body;

    const expense = new Expense({
      upi_id,
      category,
      amount,
      date: date || Date.now()
    });

    await expense.save();

    res.status(201).json({ message: "Expense added", expense });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/tracker/:upi_id
exports.getExpensesByUpi = async (req, res) => {
  try {
    const { upi_id } = req.params;
    const expenses = await Expense.find({ upi_id }).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/tracker/stats/:upi_id
exports.getCategoryWiseStats = async (req, res) => {
  try {
    const { upi_id } = req.params;
    const stats = await Expense.aggregate([
      { $match: { upi_id } },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: "$_id",
          totalAmount: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
