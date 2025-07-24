// 📁 backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { generateOTP, sendOTP, maskEmail, maskPhone } = require('../utils/otp');
const { createJWT, verifyJWT } = require('../utils/jwt');

let otpStore = {}; // In-memory OTP store

// Dummy user data based on card number
const userDatabase = {
  'CARD123456': {
    name: 'sahitya g',
    email: 'autofillgenie@example.com',
    phone: '8408883452',
    dob: '1999-10-10',
    address: 'Pune, India'
  },
  // Add more card records as needed
};

// Step 1: Receive card number and send OTP
router.post('/send-otp', async (req, res) => {
  const { cardNumber } = req.body;
  const user = userDatabase[cardNumber];

  if (!user) {
    return res.status(404).json({ success: false, message: 'Card not found' });
  }

  const otp = generateOTP();
  otpStore[cardNumber] = { otp, timestamp: Date.now() };
  console.log("***********", otp)
  await sendOTP(user.email, user.phone, otp);

  res.json({ 
    success: true, 
    message: 'OTP sent to email and phone.',
    maskedMail: maskEmail(user.email),
    maskedPhone: user.phone && maskPhone(user.phone) || ''
 });
});

// Step 2: Verify OTP and return personal info
router.post('/verify-otp-fetch-data', (req, res) => {
  const { cardNumber, otp } = req.body;
  const record = otpStore[cardNumber];
  const user = userDatabase[cardNumber];
  console.log(record )
  if (!record || record.otp !== otp) {
    return res.status(401).json({ success: false, message: 'Invalid OTP' });
  }
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const maskedUser ={
    ...user,
    email: maskEmail(user.email),
    phone: maskPhone(user.phone)
  }
  const token = createJWT({ cardNumber });
  return res.json({ success: true, token, data: maskedUser });
});

// Optional protected route
router.get('/profile', verifyJWT, (req, res) => {
  const cardNumber = req.user.cardNumber;
  const user = userDatabase[cardNumber];

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ success: true, data: user });
});

module.exports = router;
