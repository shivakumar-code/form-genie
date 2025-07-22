const nodemailer = require('nodemailer');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(email, phone, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS_KEY,
    },
  });

  await transporter.sendMail({
    from: '"OTP Service" <no-reply@example.com>',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}`,
  });

  console.log(`📧 OTP sent to ${email}`);
  console.log(`📱 OTP would also be sent to phone: ${phone} (SMS integration needed)`);
}

module.exports = { generateOTP, sendOTP };
