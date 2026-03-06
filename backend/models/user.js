const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  email: { type: String },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  countryCode: { type: String, default: "+91" },
  upi_id: { type: [String], required: true },
  upi_pin: { type: String, default: "" },
  bank_account: { type: String, default: "" },
  bank_name: { type: String, default: "" },
  balance: { type: Number, default: 0 },
  qr_code_url: { type: String },
  profile_photo_url: { type: String },
  referralCode: { type: String },
  referredBy: { type: String, default: "" },
  rewardPoints: { type: Number, default: 0 },
  dob: { type: String, default: "" },
  gender: { type: String, default: "" },
  address: { type: String, default: "" },
  occupation: { type: String, default: "" },
  profileCompleted: { type: Boolean, default: false },
  theme: { type: String, default: "light" },
  notifications: { type: Boolean, default: true },
  biometric: { type: Boolean, default: false },
  language: { type: String, default: "en" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
