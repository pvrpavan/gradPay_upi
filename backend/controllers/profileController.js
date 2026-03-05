// controllers/profileController.js
const User = require("../models/User");
const QRCode = require("qrcode");

// GET /api/profile/:upi_id
exports.getProfile = async (req, res) => {
  try {
    const { upi_id } = req.params;

    const user = await User.findOne({ upi_id }).select("-otp -__v -_id");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/profile/:upi_id/qrcode
exports.getQRCode = async (req, res) => {
  try {
    const { upi_id } = req.params;
    const upiUrl = `upi://pay?pa=${upi_id}&pn=Gradious%20Pay%20User`;

    const qrImageData = await QRCode.toDataURL(upiUrl);
    res.status(200).json({ qrCode: qrImageData });
  } catch (err) {
    console.error("QR Code Error:", err);
    res.status(500).json({ message: "Failed to generate QR code" });
  }
};
