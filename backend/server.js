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

// In-memory log store for web-based log viewer
const logStore = [];
const MAX_LOGS = 500;

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  const msg = args.map(a => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  logStore.push({ level: "info", message: msg, timestamp: new Date().toISOString() });
  if (logStore.length > MAX_LOGS) logStore.shift();
  originalLog.apply(console, args);
};
console.error = (...args) => {
  const msg = args.map(a => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  logStore.push({ level: "error", message: msg, timestamp: new Date().toISOString() });
  if (logStore.length > MAX_LOGS) logStore.shift();
  originalError.apply(console, args);
};
console.warn = (...args) => {
  const msg = args.map(a => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  logStore.push({ level: "warn", message: msg, timestamp: new Date().toISOString() });
  if (logStore.length > MAX_LOGS) logStore.shift();
  originalWarn.apply(console, args);
};

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();

// Log viewer endpoint - shows backend logs on localhost web
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>GradPay Backend Logs</title>
      <style>
        body { font-family: 'Courier New', monospace; background: #1a1a2e; color: #e0e0e0; padding: 20px; }
        h1 { color: #f65e1d; }
        .log { padding: 6px 12px; margin: 2px 0; border-radius: 4px; font-size: 13px; }
        .info { background: #16213e; border-left: 3px solid #4caf50; }
        .error { background: #2d1b1b; border-left: 3px solid #f44336; }
        .warn { background: #2d2a1b; border-left: 3px solid #ff9800; }
        .timestamp { color: #888; font-size: 11px; }
        .controls { margin: 10px 0; }
        .controls button { background: #f65e1d; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-right: 8px; }
        .controls button:hover { background: #e5531a; }
        #status { color: #4caf50; font-size: 12px; margin-left: 10px; }
      </style>
    </head>
    <body>
      <h1>GradPay Backend Logs</h1>
      <div class="controls">
        <button onclick="fetchLogs()">Refresh</button>
        <button onclick="toggleAuto()">Toggle Auto-Refresh</button>
        <button onclick="clearLogs()">Clear Display</button>
        <span id="status">Auto-refresh: ON</span>
      </div>
      <div id="logs"></div>
      <script>
        let autoRefresh = true;
        let interval;
        function fetchLogs() {
          fetch('/api/logs').then(r => r.json()).then(logs => {
            const el = document.getElementById('logs');
            el.innerHTML = logs.map(l => '<div class="log ' + l.level + '"><span class="timestamp">' + new Date(l.timestamp).toLocaleString() + '</span> [' + l.level.toUpperCase() + '] ' + l.message + '</div>').join('');
            el.scrollTop = el.scrollHeight;
          });
        }
        function toggleAuto() {
          autoRefresh = !autoRefresh;
          document.getElementById('status').textContent = 'Auto-refresh: ' + (autoRefresh ? 'ON' : 'OFF');
          if (autoRefresh) startAuto(); else clearInterval(interval);
        }
        function clearLogs() { document.getElementById('logs').innerHTML = ''; }
        function startAuto() { interval = setInterval(fetchLogs, 2000); }
        fetchLogs();
        startAuto();
      </script>
    </body>
    </html>
  `);
});

// Logs API endpoint
app.get("/api/logs", (req, res) => {
  res.json(logStore);
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
