# GradPay - UPI Payment Application

GradPay is a full-stack digital payment application similar to Google Pay, built for students, young professionals, and small vendors. Users can send/receive money via UPI wallets, track expenses with visual analytics, chat with other users, and manage their profiles.

![GradPay Logo](frontend/public/photos/gradious-pay-logo-final.png)

---

## Features

- **OTP-Based Authentication** — Phone number login with 6-digit OTP verification
- **Send & Receive Money** — Transfer funds using UPI IDs with real-time balance updates
- **Transaction History** — View, filter (debit/credit), and paginate past transactions
- **Expense Tracker** — Add expenses by category with interactive pie chart analytics
- **QR Code Scanner** — Scan QR codes to initiate payments
- **Real-Time Chat** — Chat with other users via Socket.IO with payment intent support
- **Profile Management** — View UPI IDs, personal details, and QR code
- **Reward Points** — Earn points for making transactions
- **Responsive Mobile UI** — Designed for mobile-first experience (max-width 430px)

---

## Tech Stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | React, Vite, Tailwind CSS, React Router, Recharts       |
| Backend    | Node.js, Express.js, Socket.IO                          |
| Database   | MongoDB (Mongoose ODM)                                  |
| Icons      | Lucide React                                            |
| OTP        | Custom OTP generator (console-logged in dev mode)       |
| QR Codes   | qrcode (Node.js library)                                |

---

## Prerequisites

Make sure you have these installed on your machine before starting:

1. **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **MongoDB** (v6 or higher) — [Download](https://www.mongodb.com/try/download/community)
4. **Git** — [Download](https://git-scm.com/)

---

## How to Run Locally (Step by Step)

### Step 1: Clone the Repository

```bash
git clone https://github.com/pvrpavan/gradPay_upi.git
cd gradPay_upi
```

### Step 2: Start MongoDB

Make sure MongoDB is running on your machine:

```bash
# On Linux/Mac
mongod

# On Windows (if installed as service, it runs automatically)
# Otherwise open Command Prompt and run:
mongod
```

MongoDB should be running on `mongodb://localhost:27017`

### Step 3: Set Up the Backend

```bash
# Navigate to the backend folder
cd backend

# Install backend dependencies
npm install

# Create the environment file
cp .env.example .env
```

Open the `.env` file and make sure it has:

```
MONGO_URI=mongodb://localhost:27017/gradpay
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

Now start the backend server:

```bash
npm start
```

You should see:

```
Server running on http://localhost:5000
MongoDB Connected
```

**Keep this terminal open.** The backend runs on port 5000.

### Step 4: Set Up the Frontend

Open a **new terminal** window:

```bash
# Navigate to the frontend folder (from project root)
cd frontend

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

You should see:

```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 5: Open the App

Open your browser and go to:

```
http://localhost:5173
```

---

## How to Use the App

### Login Flow

1. Open the app → You'll see the **Get Started** page
2. Tap **Get Started** → Enter your 10-digit phone number
3. Tap **Send OTP** → The OTP is printed in the **backend terminal console**
4. Enter the 6-digit OTP (in dev mode, it auto-fills from the API response)
5. If you're a new user → You'll be redirected to **Create Account**
6. Fill in your name, email, and password → Tap **Create Account**
7. You'll land on the **Dashboard** with ₹5,000 starting balance

### Sending Money

1. From the Dashboard, tap **Send Money**
2. Search for a user by phone number or name
3. Select the user, enter the amount, and optionally add a note
4. Tap **Send** → Transaction is processed instantly

### Other Features

- **Balance**: View your current wallet balance
- **History**: See all transactions with debit/credit filters
- **Tracker**: Add and categorize expenses, view pie chart analytics
- **Scanner**: Scan QR codes for payments
- **Chat**: Search for users and send messages in real-time
- **Profile**: View your UPI IDs, personal details, and QR code
- **FAQs**: Common questions and answers

---

## OTP Service

In **development mode**, GradPay uses a custom OTP generator that:

- Generates a random 6-digit OTP
- Logs it to the **backend console** (check your backend terminal)
- Returns it in the API response for easy testing (auto-fills on the frontend)

### For Production (Twilio SMS)

To use real SMS OTP in production, integrate [Twilio](https://www.twilio.com/):

1. Sign up at [twilio.com](https://www.twilio.com/)
2. Get your Account SID, Auth Token, and a phone number
3. Install the Twilio SDK:
   ```bash
   cd backend
   npm install twilio
   ```
4. Update `backend/controllers/authController.js` to send OTP via Twilio:
   ```javascript
   const twilio = require('twilio');
   const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

   // Inside sendOtp function, replace console.log with:
   await client.messages.create({
     body: `Your GradPay OTP is: ${otp}`,
     from: process.env.TWILIO_PHONE,
     to: `+91${phone}`
   });
   ```
5. Add to your `.env`:
   ```
   TWILIO_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE=your_twilio_phone_number
   ```

---

## API Endpoints

| Method | Endpoint                                  | Description                    |
| ------ | ----------------------------------------- | ------------------------------ |
| POST   | `/api/auth/send-otp`                      | Send OTP to phone number       |
| POST   | `/api/auth/verify-otp`                    | Verify OTP                     |
| POST   | `/api/auth/create-account`                | Create new user account        |
| GET    | `/api/auth/profile?phone=XXXX`            | Get user profile by phone      |
| GET    | `/api/auth/search?query=XXXX`             | Search users                   |
| POST   | `/api/transactions/transfer`              | Send money                     |
| GET    | `/api/transactions/upi/:upi_id`           | Get transaction history        |
| GET    | `/api/transactions/id/:id`                | Get transaction by ID          |
| GET    | `/api/profile/:upi_id`                    | Get profile by UPI ID          |
| GET    | `/api/profile/:upi_id/qrcode`             | Get QR code for UPI ID         |
| POST   | `/api/tracker`                             | Add expense                    |
| GET    | `/api/tracker/:upi_id`                    | Get expenses for user          |
| GET    | `/api/tracker/stats/:upi_id`              | Get category-wise expense stats|
| POST   | `/api/chats/send`                         | Send a chat message            |
| GET    | `/api/chats/conversation/:user1/:user2`   | Get chat history between users |

---

## Project Structure

```
gradPay_upi/
├── backend/
│   ├── config.js              # MongoDB connection
│   ├── server.js              # Express + Socket.IO server
│   ├── .env.example           # Environment variables template
│   ├── controllers/
│   │   ├── authController.js      # OTP, login, signup, search
│   │   ├── transactionController.js # Money transfer, history
│   │   ├── trackerController.js   # Expense tracking
│   │   ├── chatController.js      # Chat messages
│   │   └── profileController.js   # Profile & QR code
│   ├── models/
│   │   ├── user.js            # User schema
│   │   ├── otp.js             # OTP schema (5 min TTL)
│   │   ├── transaction.js     # Transaction schema
│   │   ├── expense.js         # Expense schema
│   │   └── chat.js            # Chat message schema
│   └── routes/
│       ├── auth.js            # Auth routes
│       ├── transactions.js    # Transaction routes
│       ├── profile.js         # Profile routes
│       ├── expenses.js        # Expense routes
│       └── chats.js           # Chat routes
├── frontend/
│   ├── vite.config.js         # Vite config with API proxy
│   ├── public/photos/         # All app images and logos
│   └── src/
│       ├── App.jsx            # Main app with routing
│       ├── index.css           # Tailwind CSS + custom styles
│       ├── context/
│       │   └── AuthContext.jsx # Auth state management
│       ├── components/
│       │   ├── BottomNav.jsx  # Bottom navigation bar
│       │   └── TopBar.jsx     # Top header bar
│       ├── pages/
│       │   ├── GetStarted.jsx     # Landing page
│       │   ├── Login.jsx          # OTP login flow
│       │   ├── CreateAccount.jsx  # New user registration
│       │   ├── Dashboard.jsx      # Main dashboard
│       │   ├── Profile.jsx        # User profile
│       │   ├── Balance.jsx        # Wallet balance
│       │   ├── SendMoney.jsx      # Send money flow
│       │   ├── TransactionHistory.jsx # Transaction list
│       │   ├── ExpenseTracker.jsx # Expense tracking + charts
│       │   ├── Scanner.jsx        # QR code scanner
│       │   ├── Chat.jsx           # Real-time chat
│       │   ├── Deposit.jsx        # Add money
│       │   └── FAQs.jsx           # FAQ accordion
│       └── utils/
│           └── api.js         # Centralized API client
└── README.md
```

---

## Troubleshooting

| Problem                        | Solution                                                    |
| ------------------------------ | ----------------------------------------------------------- |
| MongoDB not connecting         | Make sure `mongod` is running on port 27017                 |
| Backend won't start            | Check `.env` file exists with correct `MONGO_URI`           |
| Frontend shows blank page      | Run `npm install` in the frontend folder                    |
| OTP not received               | Check the backend terminal — OTP is logged in the console   |
| "Cannot find module" error     | Run `npm install` in the respective folder                  |
| Port 5000 already in use       | Change PORT in `.env` or kill the process using port 5000   |

---

## License

MIT License
