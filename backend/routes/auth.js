const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  createAccount,
  getProfile,
  searchUsers,
} = require("../controllers/authController");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/create-account", createAccount);
router.get("/profile", getProfile);
router.get("/search", searchUsers);

module.exports = router;
