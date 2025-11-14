// --- 0. IMPORTS ---
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

// --- 1. INITIALIZE EXPRESS APP ---
const app = express();
// Using port 3001 to match your HTML files
const PORT = process.env.PORT || 3001;

// --- 2. MIDDLEWARE ---
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Parse incoming JSON bodies

// --- 3. DEFINE USER MODEL ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// --- 4. API ROUTES (ENDPOINTS) ---

// POST /register
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username: username,
      password: hashedPassword
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // === THIS IS THE CRITICAL PART ===
    // We are now sending the username back to the login.html page
    res.status(200).json({ 
      message: 'Login successful',
      username: user.username // <-- This line makes the "Logout" button work
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// --- 5. START THE SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('...Attempting to connect to MongoDB...');
});

// --- 6. CONNECT TO MONGODB ---
const MONGO_URI = 'mongodb://localhost:27017/gym-app';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('>>> Successfully connected to MongoDB <<<');
})
.catch(err => {
  console.error('\n!!! FAILED TO CONNECT TO MONGODB !!!');
  console.error('Error Details:', err.message);
  console.log('\nPlease ensure MongoDB is running and accessible at ' + MONGO_URI);
});