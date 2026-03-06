const Otp = require("../models/Otp");
const User = require("../models/User");
const qrcode = require("qrcode");
const crypto = require("crypto");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateReferralCode = (phone) => "GP" + phone.slice(-4) + crypto.randomBytes(2).toString("hex").toUpperCase();

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

    // Return OTP in response (for dev/demo - backend holds OTP for auto-fill consent flow)
    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { phone, otp, countryCode } = req.body;

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
        countryCode: countryCode || "+91",
        password: "default",
        upi_id: [`${phone}@gradious`, `${phone}@gradpay`],
        referralCode: generateReferralCode(phone),
        balance: 0,
      });

      const qrCodeData = await qrcode.toDataURL(`upi://pay?pa=${phone}@gradious&pn=New%20User`);
      user.qr_code_url = qrCodeData;

      await user.save();

      return res.status(201).json({
        message: "New user created",
        user,
        isNewUser: true,
        phone,
      });
    }

    let updated = false;

    if (!user.upi_id || user.upi_id.length === 0) {
      user.upi_id = [`${phone}@gradious`, `${phone}@gradpay`];
      updated = true;
    }

    if (!user.qr_code_url) {
      const upiId = Array.isArray(user.upi_id) ? user.upi_id[0] : user.upi_id;
      const qrCodeData = await qrcode.toDataURL(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(user.displayName)}`);
      user.qr_code_url = qrCodeData;
      updated = true;
    }

    if (!user.referralCode) {
      user.referralCode = generateReferralCode(phone);
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
          profile_photo_url: "",
          referralCode: generateReferralCode(phone),
        },
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
      countryCode: user.countryCode,
      email: user.email,
      upi_id: user.upi_id,
      upi_pin: user.upi_pin ? true : false,
      bank_name: user.bank_name,
      bank_account: user.bank_account,
      balance: user.balance,
      profile_photo_url: user.profile_photo_url,
      qr_code_url: user.qr_code_url,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      rewardPoints: user.rewardPoints,
      dob: user.dob,
      gender: user.gender,
      address: user.address,
      occupation: user.occupation,
      profileCompleted: user.profileCompleted,
      theme: user.theme,
      notifications: user.notifications,
      biometric: user.biometric,
      language: user.language,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone is required" });

  try {
    const allowedFields = [
      "displayName", "email", "dob", "gender", "address", "occupation",
      "profile_photo_url", "bank_name", "bank_account",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Check if profile is completed
    const user = await User.findOne({ phone });
    if (user) {
      const merged = { ...user.toObject(), ...updates };
      if (merged.displayName && merged.displayName !== "New User" && merged.email && merged.dob && merged.gender) {
        updates.profileCompleted = true;
      }
    }

    const updatedUser = await User.findOneAndUpdate({ phone }, { $set: updates }, { new: true });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

const updateSettings = async (req, res) => {
  const { phone, theme, notifications, biometric, language } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone is required" });

  try {
    const updates = {};
    if (theme !== undefined) updates.theme = theme;
    if (notifications !== undefined) updates.notifications = notifications;
    if (biometric !== undefined) updates.biometric = biometric;
    if (language !== undefined) updates.language = language;

    const user = await User.findOneAndUpdate({ phone }, { $set: updates }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "Settings updated", settings: { theme: user.theme, notifications: user.notifications, biometric: user.biometric, language: user.language } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

const applyReferral = async (req, res) => {
  const { phone, referralCode } = req.body;
  if (!phone || !referralCode) return res.status(400).json({ error: "Phone and referral code required" });

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.referredBy) return res.status(400).json({ error: "Already applied a referral code" });

    const referrer = await User.findOne({ referralCode });
    if (!referrer) return res.status(404).json({ error: "Invalid referral code" });
    if (referrer.phone === phone) return res.status(400).json({ error: "Cannot use your own referral code" });

    user.referredBy = referralCode;
    user.rewardPoints = (user.rewardPoints || 0) + 100;
    await user.save();

    referrer.rewardPoints = (referrer.rewardPoints || 0) + 150;
    await referrer.save();

    console.log(`Referral applied: ${phone} used code ${referralCode} from ${referrer.phone}`);

    res.status(200).json({ message: "Referral applied! You earned 100 points.", rewardPoints: user.rewardPoints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to apply referral" });
  }
};

const setUpiPin = async (req, res) => {
  const { phone, upiPin } = req.body;
  if (!phone || !upiPin) return res.status(400).json({ error: "Phone and UPI PIN required" });
  if (upiPin.length < 4 || upiPin.length > 6) return res.status(400).json({ error: "UPI PIN must be 4-6 digits" });

  try {
    const user = await User.findOneAndUpdate({ phone }, { $set: { upi_pin: upiPin } }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "UPI PIN set successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to set UPI PIN" });
  }
};

const verifyUpiPin = async (req, res) => {
  const { phone, upiPin } = req.body;
  if (!phone || !upiPin) return res.status(400).json({ error: "Phone and UPI PIN required" });

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.upi_pin) return res.status(400).json({ error: "UPI PIN not set. Please set it first.", notSet: true });
    if (user.upi_pin !== upiPin) return res.status(400).json({ error: "Incorrect UPI PIN" });
    res.status(200).json({ message: "UPI PIN verified" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify UPI PIN" });
  }
};

const getAllUsers = async (req, res) => {
  const { exclude } = req.query;
  try {
    const filter = exclude ? { phone: { $ne: exclude } } : {};
    const users = await User.find(filter)
      .select("displayName phone upi_id profile_photo_url balance")
      .limit(50);
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get users" });
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

// Seed sample data
const seedData = async (req, res) => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers >= 5) {
      return res.status(200).json({ message: "Sample data already exists", count: existingUsers });
    }

    const sampleUsers = [
      {
        displayName: "Rahul Sharma", phone: "9876543210", countryCode: "+91",
        password: "1234", email: "rahul@example.com",
        upi_id: ["rahul.3210@gradpay", "9876543210@gradious"],
        balance: 15000, bank_name: "SBI", bank_account: "XXXX1234",
        referralCode: "GP3210A1B2", rewardPoints: 250,
        dob: "1995-03-15", gender: "Male", address: "Hyderabad, India",
        occupation: "Software Engineer", profileCompleted: true,
        upi_pin: "1234",
      },
      {
        displayName: "Priya Patel", phone: "9876543211", countryCode: "+91",
        password: "1234", email: "priya@example.com",
        upi_id: ["priya.3211@gradpay", "9876543211@gradious"],
        balance: 8500, bank_name: "HDFC", bank_account: "XXXX5678",
        referralCode: "GP3211C3D4", rewardPoints: 150,
        dob: "1998-07-22", gender: "Female", address: "Mumbai, India",
        occupation: "Designer", profileCompleted: true,
        upi_pin: "1234",
      },
      {
        displayName: "Amit Kumar", phone: "9876543212", countryCode: "+91",
        password: "1234", email: "amit@example.com",
        upi_id: ["amit.3212@gradpay", "9876543212@gradious"],
        balance: 22000, bank_name: "ICICI", bank_account: "XXXX9012",
        referralCode: "GP3212E5F6", rewardPoints: 400,
        dob: "1992-11-08", gender: "Male", address: "Delhi, India",
        occupation: "Business Owner", profileCompleted: true,
        upi_pin: "1234",
      },
      {
        displayName: "Sneha Reddy", phone: "9876543213", countryCode: "+91",
        password: "1234", email: "sneha@example.com",
        upi_id: ["sneha.3213@gradpay", "9876543213@gradious"],
        balance: 5200, bank_name: "Axis", bank_account: "XXXX3456",
        referralCode: "GP3213G7H8", rewardPoints: 75,
        dob: "2000-01-30", gender: "Female", address: "Bangalore, India",
        occupation: "Student", profileCompleted: true,
        upi_pin: "1234",
      },
      {
        displayName: "Vikram Singh", phone: "9876543214", countryCode: "+91",
        password: "1234", email: "vikram@example.com",
        upi_id: ["vikram.3214@gradpay", "9876543214@gradious"],
        balance: 32000, bank_name: "Kotak", bank_account: "XXXX7890",
        referralCode: "GP3214I9J0", rewardPoints: 600,
        dob: "1990-06-12", gender: "Male", address: "Chennai, India",
        occupation: "Manager", profileCompleted: true,
        upi_pin: "1234",
      },
    ];

    // Generate QR codes for each user
    for (const u of sampleUsers) {
      u.qr_code_url = await qrcode.toDataURL(`upi://pay?pa=${u.upi_id[0]}&pn=${encodeURIComponent(u.displayName)}`);
    }

    await User.insertMany(sampleUsers);

    // Add sample transactions
    const Transaction = require("../models/Transaction");
    const sampleTransactions = [
      { sender_upi: "rahul.3210@gradpay", receiver_upi: "priya.3211@gradpay", amount: 500, type: "debit", note: "Lunch split", timestamp: new Date(Date.now() - 86400000) },
      { sender_upi: "rahul.3210@gradpay", receiver_upi: "priya.3211@gradpay", amount: 500, type: "credit", note: "Lunch split", timestamp: new Date(Date.now() - 86400000) },
      { sender_upi: "priya.3211@gradpay", receiver_upi: "amit.3212@gradpay", amount: 1200, type: "debit", note: "Shopping", timestamp: new Date(Date.now() - 172800000) },
      { sender_upi: "priya.3211@gradpay", receiver_upi: "amit.3212@gradpay", amount: 1200, type: "credit", note: "Shopping", timestamp: new Date(Date.now() - 172800000) },
      { sender_upi: "amit.3212@gradpay", receiver_upi: "sneha.3213@gradpay", amount: 2000, type: "debit", note: "Birthday gift", timestamp: new Date(Date.now() - 259200000) },
      { sender_upi: "amit.3212@gradpay", receiver_upi: "sneha.3213@gradpay", amount: 2000, type: "credit", note: "Birthday gift", timestamp: new Date(Date.now() - 259200000) },
      { sender_upi: "vikram.3214@gradpay", receiver_upi: "rahul.3210@gradpay", amount: 3500, type: "debit", note: "Freelance payment", timestamp: new Date(Date.now() - 345600000) },
      { sender_upi: "vikram.3214@gradpay", receiver_upi: "rahul.3210@gradpay", amount: 3500, type: "credit", note: "Freelance payment", timestamp: new Date(Date.now() - 345600000) },
      { sender_upi: "sneha.3213@gradpay", receiver_upi: "vikram.3214@gradpay", amount: 750, type: "debit", note: "Movie tickets", timestamp: new Date(Date.now() - 432000000) },
      { sender_upi: "sneha.3213@gradpay", receiver_upi: "vikram.3214@gradpay", amount: 750, type: "credit", note: "Movie tickets", timestamp: new Date(Date.now() - 432000000) },
    ];

    await Transaction.insertMany(sampleTransactions);

    console.log("Sample data seeded successfully");
    res.status(201).json({ message: "Sample data seeded", users: sampleUsers.length, transactions: sampleTransactions.length });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: "Failed to seed data" });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  createAccount,
  getProfile,
  updateProfile,
  updateSettings,
  applyReferral,
  setUpiPin,
  verifyUpiPin,
  getAllUsers,
  searchUsers,
  seedData,
};
