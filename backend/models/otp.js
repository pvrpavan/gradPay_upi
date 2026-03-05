// models/Otp.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // expires in 5 minutes (300 seconds)
    }
});

module.exports = mongoose.model("Otp", otpSchema);
