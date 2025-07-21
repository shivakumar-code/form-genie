import React, { useState, useCallback, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
// import CustomWebcam from './CustomWebcam'

function App() {
  const [extractedText, setExtractText] = useState(null);
  const [idImage, setIdImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [citizenId, setCitizenId] = useState("");
  const [data, setData] = useState(null);

  const webCamRef = React.useRef(null);

  const handleImageChange = (e) => {
    setIdImage(URL.createObjectURL(e.target.files[0]));
  };

  // upload and scan the card
  const handleScanCard = async () => {
    if (!idImage) return;
    setProcessing(true);
    const {
      data: { text },
    } = await Tesseract.recognize(idImage, 'eng');
    setExtractText(text);
    setProcessing(false);
  };

  const handleSendOtp = async () => {
    try {
      await axios.post("http://localhost:5000/send-otp", {
        citizenId,
        email,
        phone
      });
      setOtpSent(true);
      alert("OTP sent via email & SMS");
    } catch (err) {
      alert("Error sending OTP");
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webCamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webCamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  // Send to backend
  const handleFetchData = async () => {
    const res = await axios.post("http://localhost:5000/fetch-data", {
      citizenId: citizenId && extractedText.length < 5 ? extractedText : '123',
      imgSrc,
      otp
    });
    setData(res.data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Citizen ID App</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleScanCard} disabled={!idImage || processing}>
        {processing ? "Processing..." : "Scan ID Card/Extract Text"}
      </button>

      <h3>Before fetching user need to be authenticated</h3>
      <div>Citizen ID: {citizenId || extractedText}</div>
      <textarea rows="10" cols="50" value={extractedText}></textarea>

      <h4>Email and Phone for OTP</h4>
      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="tel"
        placeholder="Enter Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {otpSent && (
        <>
          <button onClick={handleSendOtp} disabled={!citizenId || !email || !phone}>
            Send OTP
          </button>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </>
      )}

      <div className="container">
        {imgSrc ? (
          <img src={imgSrc} alt="captured face" width={200} />
        ) : (
          <Webcam height={600} width={600} ref={webCamRef} />
        )}

        <div className="btn-container">
          {imgSrc ? (
            <button onClick={retake}>Retake photo</button>
          ) : (
            <button onClick={capture}>Capture photo</button>
          )}
        </div>
      </div>

      {imgSrc && (
        <button onClick={handleFetchData}>
          Fetch Person Data
        </button>
      )}

      <pre style={{ textAlign: 'left' }}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default App;
