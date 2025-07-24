require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password
    },
});


let storedOtp = '';
let otpExpiryTime = null;

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPSMS = (phone, otp) => {
    return twilioClient.messages.create({
        body: `Your OTP is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
    });
};


// Rate Limiter for OTP
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 5, // 5 requests max
    message: {
        status: 429,
        message: 'Too many OTP requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});


// POST /send-otp
app.post('/send-otp', otpLimiter, async (req, res) => {
    const { email, phone } = req.body;

    const otp = generateOTP();
    storedOtp = otp;
    otpExpiryTime = Date.now() + 5 * 60 * 1000; // 5 min validity

    try {
        // Send Email
        if (email) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your OTP Code',
                text: `Your OTP is: ${otp}`,
            });
        }

        // Send SMS
        if (phone) {
        await sendOTPSMS(phone, otp);
        }

        console.log(`✅ OTP sent: ${otp}`);
        return res.status(200).json({ message: 'OTP sent to registered email or mobile' });

    } catch (error) {
        return res.status(500).json({ message: 'Failed to send OTP' });
    }
});

// POST /verify-otp
app.post('/verify-otp', async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ message: 'OTP is required' });
        }

        if (Date.now() > otpExpiryTime) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (otp === storedOtp) {
            storedOtp = ''; // Clear after use
            return res.status(200).json({ message: 'OTP verified successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});