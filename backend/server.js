// const express = require('express');
// const path = require('path');
// const app = express();

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend', 'get_started.html'));
// });

// app.use(express.static(path.join(__dirname, '../frontend')));



// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });





















// const express = require("express");
// const connectDB = require("./config");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// connectDB();

// app.use(cors());
// app.use(express.json());



// // Test route
// app.get("/", (req, res) => {
//   res.send("Gradious Pay Backend Running!");
// });



// const authRoutes = require("./routes/auth");
// const transactionRoutes = require("./routes/transactions");
// const profileRoutes = require("./routes/profile");


// app.use("/api/profile", profileRoutes);

// app.use("/api/auth", authRoutes);

// app.use("/api/transactions", transactionRoutes);

// // app.use("/api/chats", require("./routes/chats"));

// // app.use("/api/expenses", require("./routes/expenses"));




// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




























const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config");
const Chat = require("./models/Chat");
const path = require("path");

dotenv.config();

// App and Server Setup
const app = express();
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'get_started.html'));
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// DB Connection
connectDB();




// Import routes
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const profileRoutes = require("./routes/profile");
const chatRoutes = require("./routes/chats");
const trackerRoutes = require("./routes/expenses");



// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/tracker", trackerRoutes);
app.use("/api/chats", chatRoutes);

// Socket.IO for Real-Time Chat
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // frontend domain in production
    methods: ["GET", "POST"]
  }
});

// Active users map
const activeUsers = {};

io.on("connection", (socket) => {
  console.log("🔌 A user connected");

  // Join event
  socket.on("join", (userId) => {
    activeUsers[userId] = socket.id;
    console.log(`✅ User joined: ${userId}`);
  });

  // Message event
  socket.on("send_message", async (data) => {
    try {
      const { from, to, message, isPaymentIntent, amount } = data;

      const chat = new Chat({ from, to, message, isPaymentIntent, amount });
      await chat.save();

      const receiverSocketId = activeUsers[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", chat);
      }
    } catch (err) {
      console.error("❌ Chat Save Error:", err);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    const userId = Object.keys(activeUsers).find((key) => activeUsers[key] === socket.id);
    if (userId) {
      delete activeUsers[userId];
      console.log(`❌ User disconnected: ${userId}`);
    }
  });
});

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
