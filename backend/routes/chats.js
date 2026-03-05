const express = require("express");
const router = express.Router();

const {
  saveChat,
  getChatsBetweenUsers
} = require("../controllers/chatController");

router.post("/send", saveChat);

router.get("/conversation/:user1/:user2", getChatsBetweenUsers);

module.exports = router;
