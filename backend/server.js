const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config");
const Chat = require("./models/Chat");

dotenv.config();

// App and Server Setup
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();

// Test route
app.get("/", (req, res) => {
  res.json({ message: "GradPay Backend Running!" });
});

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
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Active users map
const activeUsers = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (userId) => {
    activeUsers[userId] = socket.id;
    console.log(`User joined: ${userId}`);
  });

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
      console.error("Chat Save Error:", err);
    }
  });

  socket.on("disconnect", () => {
    const userId = Object.keys(activeUsers).find((key) => activeUsers[key] === socket.id);
    if (userId) {
      delete activeUsers[userId];
      console.log(`User disconnected: ${userId}`);
    }
  });
});

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
