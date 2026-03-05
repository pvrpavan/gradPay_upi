const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const MONGO_DB_URL = process.env.MONGO_DB_URL;
mongoose.connect(MONGO_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err)
});

