const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');  // Import morgan for logging

const app = express();
app.use(bodyParser.json());
app.use(morgan('dev'));  // Enable request logging

// Simple login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login Request:', req.body);  // Log request body

  // Dummy login logic
  if (email === 'test@example.com' && password === 'password') {
    return res.json({ success: true, message: 'Login successful' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
