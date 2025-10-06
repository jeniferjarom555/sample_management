// otpController.js
const pool = require("../db");

// Define the single allowed phlebotomist phone number
const allowedPhone = "8122761467"; // <-- change this to your number

// Send OTP
const sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number required" });
  }

  // Allow only the single phlebotomist
  if (phone !== allowedPhone) {
    return res.status(403).json({ success: false, message: "Phone not allowed" });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 minutes

  try {
    // Save OTP to the database
    await pool.query(
      "INSERT INTO otps (phone, otp, expires_at) VALUES ($1, $2, $3)",
      [phone, otp, expiresAt]
    );

    console.log(`OTP saved for ${phone}: ${otp}`);
    return res.status(200).json({ success: true, message: "OTP generated", otp });
  } catch (err) {
    console.error("DB Error details:", err);
    return res.status(500).json({ success: false, message: "Failed to generate OTP" });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone & OTP required" });
  }

  // Ensure only the single allowed phone is verified
  if (phone !== allowedPhone) {
    return res.status(403).json({ success: false, message: "Phone not allowed" });
  }

  try {
    // Get the latest OTP for the phone
    const result = await pool.query(
      "SELECT * FROM otps WHERE phone = $1 ORDER BY created_at DESC LIMIT 1",
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "OTP not found" });
    }

    const latestOtp = result.rows[0];

    // Check expiry
    if (new Date() > latestOtp.expires_at) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // Check match
    if (latestOtp.otp === otp) {
      return res.status(200).json({ success: true, message: "OTP verified" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};

module.exports = { sendOtp, verifyOtp };
