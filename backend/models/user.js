const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  email: { type: String },
  password: { type: String, required: true }, 
  phone: { type: String, required: true, unique: true },
  upi_id: { type: [String], required: true },
  bank_account: { type: String, default: ""},
  bank_name: { type: String, default: ""},
  balance: { type: Number, default: 0 },
  qr_code_url: { type: String },
  profile_photo_url: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
