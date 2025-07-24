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

const maskEmail = (email) =>{
  const [user, domain] = email.split('@');
  if(user.length <= 2)
    {
      return '*'.repeat(user.length)+ '@' + domain;
    } 

    const first = user[0].toUpperCase();
    const last = user.length > 4 ? user.slice(-2) : user.slice(-1);
    const masked =  '*'.repeat(user.length - first.length + last.length);

    return `${first}${masked}@${domain}`;

}

const maskPhone = (phone) =>{
  phone.replace(/.(?=.{2})/g, '*')
}


module.exports = { generateOTP, sendOTP, maskEmail, maskPhone };
