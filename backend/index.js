const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(bodyParser.json());

// Auth Routes
app.use('/api/auth', authRoutes);

// Friend Request Routes
app.use('/api/friends', friendRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
