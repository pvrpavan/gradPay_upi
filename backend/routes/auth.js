const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  createAccount,
  getProfile,
  updateProfile,
  updateSettings,
  applyReferral,
  setUpiPin,
  verifyUpiPin,
  changeUpiPin,
  getAllUsers,
  searchUsers,
  seedData,
} = require("../controllers/authController");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/create-account", createAccount);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/settings", updateSettings);
router.post("/referral", applyReferral);
router.post("/upi-pin", setUpiPin);
router.post("/verify-upi-pin", verifyUpiPin);
router.put("/change-upi-pin", changeUpiPin);
router.get("/users", getAllUsers);
router.get("/search", searchUsers);
router.post("/seed", seedData);

module.exports = router;
