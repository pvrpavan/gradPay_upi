const Otp = require("../models/Otp");
const User = require("../models/User");
const qrcode = require("qrcode");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ error: "Phone number is required" });

  const otp = generateOtp();

  try {
    await Otp.findOneAndUpdate(
      { phone },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`OTP for ${phone}: ${otp}`);

    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const existingOtp = await Otp.findOne({ phone });

    if (!existingOtp || existingOtp.otp !== otp.toString()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({
        displayName: "New User",
        phone,
        password: "default",
        upi_id: `${phone}@gradious`,
        upi_ids: [`${phone}@gradious`, `${phone}@gradpay`],
      });

      const qrCodeData = await qrcode.toDataURL(user.upi_id);
      user.qr_code_url = qrCodeData;

      await user.save();

      return res.status(201).json({
        message: "New user created",
        user,
        isNewUser: true,
        phone
      });
    }


    let updated = false;

    if (!user.upi_id || user.upi_id.length === 0) {
      user.upi_id = `${phone}@gradious`;
      user.upi_id = [`${phone}@gradious`, `${phone}@gradpay`];
      updated = true;
    }

    if (!user.qr_code_url) {
      const qrCodeData = await qrcode.toDataURL(user.upi_id);
      user.qr_code_url = qrCodeData;
      updated = true;
    }

    if (updated) await user.save();

    return res.status(200).json({ isNewUser: false, message: "OTP verified", user, phone });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
};

const createAccount = async (req, res) => {
  const { displayName, password, phone, email } = req.body;

  try {
    const existingUser = await User.findOne({ phone });
    if (!existingUser) return res.status(404).json({ error: "User not found. Please verify OTP first." });
    if (existingUser.password !== "default") return res.status(400).json({ error: "User already exists" });

    const upi_id_main = `${displayName.toLowerCase().replace(/\s+/g, "")}.${phone.slice(-4)}@gradpay`;
    const upi_ids = [upi_id_main, `${phone}@gradious`];

    const qrCodeData = await qrcode.toDataURL(`upi://pay?pa=${upi_id_main}&pn=${encodeURIComponent(displayName)}`);

    const updatedUser = await User.findOneAndUpdate(
      { phone },
      {
        $set: {
          displayName,
          email: email || "",
          password,
          upi_id: upi_ids,
          balance: 5000,
          qr_code_url: qrCodeData,
          profile_photo_url: ""
        }
      },
      { new: true }
    );

    res.status(201).json({ message: "Account created", user: updatedUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create account" });
  }
};

const getProfile = async (req, res) => {
  const { phone } = req.query;

  try {
    const user = await User.findOne({ phone });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      name: user.displayName,
      phone: user.phone,
      email: user.email,
      upi_id: user.upi_id,
      bank_name: user.bank_name,
      bank_account: user.bank_account,
      balance: user.balance,
      profile_photo_url: user.profile_photo_url,
      qr_code_url: user.qr_code_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};


const searchUsers = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Search query is required" });

  try {
    const users = await User.find({
      $or: [
        { phone: { $regex: query, $options: "i" } },
        { displayName: { $regex: query, $options: "i" } },
        { upi_id: { $regex: query, $options: "i" } },
      ],
    }).select("displayName phone upi_id profile_photo_url").limit(10);

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  createAccount,
  getProfile,
  searchUsers,
};
