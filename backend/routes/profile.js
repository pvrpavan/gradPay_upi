const express = require("express");
const router = express.Router();
const {
  getProfile,
  getQRCode,
} = require("../controllers/profileController");

router.get("/:upi_id", getProfile);
router.get("/:upi_id/qrcode", getQRCode);

module.exports = router;
