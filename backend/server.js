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
const MAX_LOGS = 1000;

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
app.use(express.json({ limit: "10mb" }));

// DB Connection
connectDB().then(async () => {
  // Auto-seed sample data on startup
  try {
    const User = require("./models/User");
    const count = await User.countDocuments();
    if (count < 5) {
      console.log("Auto-seeding sample data...");
      const { seedData } = require("./controllers/authController");
      const mockRes = {
        status: (code) => ({ json: (data) => console.log(`Seed result (${code}):`, data.message || data.error) }),
      };
      await seedData({ body: {} }, mockRes);
    } else {
      console.log(`Database already has ${count} users, skipping seed.`);
    }
  } catch (err) {
    console.error("Auto-seed error:", err.message);
  }
});

// Log viewer endpoint - shows backend logs on localhost web
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>GradPay Backend Logs</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace; background: #0d1117; color: #c9d1d9; min-height: 100vh; }
        .header { background: linear-gradient(135deg, #f65e1d, #ff9800); padding: 20px 24px; position: sticky; top: 0; z-index: 10; box-shadow: 0 4px 20px rgba(246,94,29,0.3); }
        .header h1 { color: white; font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .header p { color: rgba(255,255,255,0.7); font-size: 12px; }
        .controls { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; align-items: center; }
        .controls button { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; backdrop-filter: blur(10px); transition: all 0.2s; }
        .controls button:hover { background: rgba(255,255,255,0.3); transform: translateY(-1px); }
        .controls .active { background: white; color: #f65e1d; border-color: white; }
        #status { color: rgba(255,255,255,0.8); font-size: 11px; display: flex; align-items: center; gap: 6px; margin-left: auto; }
        #status .dot { width: 8px; height: 8px; border-radius: 50%; background: #4caf50; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .stats { display: flex; gap: 16px; padding: 12px 24px; background: #161b22; border-bottom: 1px solid #21262d; }
        .stat { font-size: 11px; color: #8b949e; }
        .stat span { font-weight: 700; margin-left: 4px; }
        .stat.info span { color: #4caf50; }
        .stat.warn span { color: #ff9800; }
        .stat.error span { color: #f44336; }
        #logs { padding: 12px 16px; overflow-y: auto; max-height: calc(100vh - 200px); }
        .log { padding: 8px 14px; margin: 3px 0; border-radius: 6px; font-size: 12px; line-height: 1.5; display: flex; gap: 10px; align-items: flex-start; transition: background 0.2s; }
        .log:hover { filter: brightness(1.2); }
        .log.info { background: #0d1f0d; border-left: 3px solid #4caf50; }
        .log.error { background: #1f0d0d; border-left: 3px solid #f44336; }
        .log.warn { background: #1f1a0d; border-left: 3px solid #ff9800; }
        .timestamp { color: #484f58; font-size: 10px; min-width: 80px; flex-shrink: 0; }
        .level { font-weight: 700; text-transform: uppercase; font-size: 10px; min-width: 45px; flex-shrink: 0; }
        .log.info .level { color: #4caf50; }
        .log.error .level { color: #f44336; }
        .log.warn .level { color: #ff9800; }
        .message { color: #c9d1d9; word-break: break-all; }
        .empty { text-align: center; padding: 60px 20px; color: #484f58; }
        .filter-input { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 14px; border-radius: 8px; font-size: 12px; outline: none; width: 160px; }
        .filter-input::placeholder { color: rgba(255,255,255,0.5); }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>GradPay Backend Logs</h1>
        <p>Real-time server monitoring dashboard</p>
        <div class="controls">
          <button onclick="setFilter('all')" class="active" id="btn-all">All</button>
          <button onclick="setFilter('info')" id="btn-info">Info</button>
          <button onclick="setFilter('warn')" id="btn-warn">Warn</button>
          <button onclick="setFilter('error')" id="btn-error">Error</button>
          <input type="text" class="filter-input" placeholder="Search logs..." oninput="searchLogs(this.value)" />
          <button onclick="clearLogs()">Clear</button>
          <button onclick="toggleAuto()">Toggle Auto</button>
          <div id="status"><div class="dot"></div> Live</div>
        </div>
      </div>
      <div class="stats" id="stats"></div>
      <div id="logs"></div>
      <script>
        let autoRefresh = true;
        let interval;
        let currentFilter = 'all';
        let searchTerm = '';
        let allLogs = [];
        function fetchLogs() {
          fetch('/api/logs').then(r => r.json()).then(logs => {
            allLogs = logs;
            renderLogs();
            updateStats();
          });
        }
        function renderLogs() {
          let filtered = allLogs;
          if (currentFilter !== 'all') filtered = filtered.filter(l => l.level === currentFilter);
          if (searchTerm) filtered = filtered.filter(l => l.message.toLowerCase().includes(searchTerm.toLowerCase()));
          const el = document.getElementById('logs');
          if (filtered.length === 0) { el.innerHTML = '<div class="empty"><p>No logs to display</p></div>'; return; }
          el.innerHTML = filtered.map(l =>
            '<div class="log ' + l.level + '">' +
            '<span class="timestamp">' + new Date(l.timestamp).toLocaleTimeString() + '</span>' +
            '<span class="level">' + l.level + '</span>' +
            '<span class="message">' + escapeHtml(l.message) + '</span></div>'
          ).join('');
          el.scrollTop = el.scrollHeight;
        }
        function escapeHtml(str) { return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        function updateStats() {
          const info = allLogs.filter(l => l.level === 'info').length;
          const warn = allLogs.filter(l => l.level === 'warn').length;
          const error = allLogs.filter(l => l.level === 'error').length;
          document.getElementById('stats').innerHTML =
            '<div class="stat">Total:<span>' + allLogs.length + '</span></div>' +
            '<div class="stat info">Info:<span>' + info + '</span></div>' +
            '<div class="stat warn">Warn:<span>' + warn + '</span></div>' +
            '<div class="stat error">Error:<span>' + error + '</span></div>';
        }
        function setFilter(f) {
          currentFilter = f;
          document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
          var btn = document.getElementById('btn-' + f);
          if (btn) btn.classList.add('active');
          renderLogs();
        }
        function searchLogs(term) { searchTerm = term; renderLogs(); }
        function toggleAuto() {
          autoRefresh = !autoRefresh;
          document.getElementById('status').innerHTML = autoRefresh ? '<div class="dot"></div> Live' : '<div class="dot" style="background:#f44336;animation:none"></div> Paused';
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
  console.log("Socket: User connected", socket.id);

  socket.on("join", (userId) => {
    activeUsers[userId] = socket.id;
    console.log(`Socket: User joined: ${userId}`);
    io.emit("online_users", Object.keys(activeUsers));
  });

  socket.on("send_message", async (data) => {
    try {
      const { from, to, message, isPaymentIntent, amount } = data;
      const chat = new Chat({ from, to, message, isPaymentIntent, amount });
      await chat.save();

      const senderSocketId = activeUsers[from];
      const receiverSocketId = activeUsers[to];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", chat);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("message_sent", chat);
      }
    } catch (err) {
      console.error("Chat Save Error:", err);
    }
  });

  socket.on("typing", (data) => {
    const { to } = data;
    const receiverSocketId = activeUsers[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user_typing", data);
    }
  });

  socket.on("stop_typing", (data) => {
    const { to } = data;
    const receiverSocketId = activeUsers[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user_stop_typing", data);
    }
  });

  socket.on("disconnect", () => {
    const userId = Object.keys(activeUsers).find((key) => activeUsers[key] === socket.id);
    if (userId) {
      delete activeUsers[userId];
      console.log(`Socket: User disconnected: ${userId}`);
      io.emit("online_users", Object.keys(activeUsers));
    }
  });
});

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
