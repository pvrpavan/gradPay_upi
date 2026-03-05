const Chat = require("../models/Chat");

exports.saveChat = async (req, res) => {
  try {
    const { from, to, message, isPaymentIntent, amount } = req.body;

    const chat = new Chat({ from, to, message, isPaymentIntent, amount });
    await chat.save();

    res.status(201).json({ message: "Chat saved", chat });
  } catch (err) {
    console.error("Save Chat Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getChatsBetweenUsers = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const chats = await Chat.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json(chats);
  } catch (err) {
    console.error("Get Chats Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
