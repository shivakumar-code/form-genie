# form-genie
Tech Stack
Backend: Node.js, Express, JWT, Nodemailer

Frontend: React, Axios

Auth Flow: OTP sent to email/phone → Verify OTP → Secure profile access

To run BE - first check postman code extention

http://localhost:5000/api/auth/send-otp // post 
# JSON
{
  "cardNumber": "CARD123456"
}
# response-
{
  "success": true,
  "message": "OTP sent to email and phone."
}

http://localhost:5000/api/auth/verify-otp //post
# JSON
{
  "cardNumber": "CARD123456",
  "otp": "871079" // enter generated code from mail or mobile
}

# RESPONSE
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYXJkTnVtYmVyIjoiQ0FSRDEyMzQ1NiIsImlhdCI6MTc1MzIwNjgwOCwiZXhwIjoxNzUzMjEwNDA4fQ.JBCj5Ze1Fw8W9hOAQBYGhID5_jCV6CROrNtUM7e6egE",
  "data": {
    "name": "sahitya g",
    "email": "autofillgenie@example.com",
    "phone": "8408883452",
    "dob": "1999-10-10",
    "address": "Pune, India"
  }
}

 http://localhost:5000/api/auth/profile // get
 # Bearer
 Enter token generated above api
 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYXJkTnVtYmVyIjoiQ0FSRDEyMzQ1NiIsImlhdCI6MTc1MzIwNjgwOCwiZXhwIjoxNzUzMjEwNDA4fQ.JBCj5Ze1Fw8W9hOAQBYGhID5_jCV6CROrNtUM7e6egE
# response come similar format
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYXJkTnVtYmVyIjoiQ0FSRDEyMzQ1NiIsImlhdCI6MTc1MzIwNjgwOCwiZXhwIjoxNzUzMjEwNDA4fQ.JBCj5Ze1Fw8W9hOAQBYGhID5_jCV6CROrNtUM7e6egE",
  "data": {
    "name": "sahitya g",
    "email": "autofillgenie@example.com",
    "phone": "8408883452",
    "dob": "1999-10-10",
    "address": "Pune, India"
  }
}