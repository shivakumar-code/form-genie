const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const citizenData = require('./data');
const fs = require('fs');
const path = require('path');
const app = express();
const multer = require('multer');
const tesseract = require('tesseract.js-node');
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS_KEY
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter error:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});

app.use(express.json({ limit: '10mb' })); // for base64 photo

// during fetch data to send screnshot images whuch come from FE in file folder -> uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  }
});
const upload = multer({ storage });

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const twilioClient = twilio(process.env.TWILIO_SID || '', process.env.TWILIO_AUTH_TOKEN || '');
const otpStore = {};

// -------- Send OTP --------
app.post('/send-otp', async (req, res) => {
  const { citizenId, email, phone } = req.body;

  if (!citizenId && (!email || !phone)) {
    return res.status(400).json({ error: "citizen ID , email or phone number required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[citizenId] = { otp, expireAt: Date.now() + 5 * 60 * 1000 }; // 5 minutes validity

  try {
    await transporter.sendMail({
      from: `MAIL NODE APP for form filler to fetch <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "New notification",
      text: `Your OTP code is ${otp}`
    });
    console.log("Mail sent");
  } catch (error) {
    console.error("Mail error:", error?.response?.body || error);
  }

  res.json({ message: "OTP sent to email and sms" });
});

// -------- verify OTP & face --------
app.post('/fetch-data', async (req, res) => {
  const { citizenId, imgSrc, otp } = req.body;

  if (!imgSrc) {
    return res.status(400).send({ message: "citizenID, OTP and photo required" });
  }

  const otpEntry = otpStore[citizenId];
  if (!otpEntry || otpEntry.otp !== otp || Date.now() > otpEntry.expireAt) {
    return res.status(401).json({ error: "Invalid or expired OTP" });
  }

  // add face recognition here if needed (placeholder)

  const data = citizenData[citizenId];
  if (!data) return res.status(404).json({ errors: "CITIZEN not found" });

  // clean up OTP after use
  delete otpStore[citizenId];

  res.json(data);
});

// -------- OCR scan to get citizen ID --------
app.post('/scan-id', upload.single('file'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const { data: { text } } = await tesseract.recognize(imagePath, 'eng');

    // Very simple regEx to find 12 digital ID
    const match = text.match(/\d{12}/);
    const citizenId = match ? match[0] : null;
    res.json({ citizenId });

  } catch (err) {
    console.log(err);
    res.status(500).send("OCR failed");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on https://localhost:${process.env.PORT}`);
});

/*
  // await sgMail.send({
  //   to: email,
  //   from: process.env.SENDER_EMAIL,
  //   subject: "your OTP code is",
  //   text: `your OTP code is ${otp}`
  // });

  // Extract base64 data img & refactor2: move to separate file to readFile function
  // const base64Data = imgSrc.replace(/^data:image\/\w+;base64,/, "");
  // const filePath = path.join(__dirname, 'uploads', `screenshot_${Date.now()}.jpg`);
  // fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

  // TODO: read image
  // console.log("Received photo length", imgSrc.length);
*/
