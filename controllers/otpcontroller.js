// otpController.js
const pool = require("../db");

// Send OTP
const sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number required" });
  }

  // generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 min

  try {
  await pool.query(
    "INSERT INTO otps (phone, otp, expires_at) VALUES ($1, $2, $3)",
    [phone, otp, expiresAt]
  );
  console.log(`OTP saved for ${phone}: ${otp}`);
  res.status(200).json({ success: true, message: "OTP generated", otp });
} catch (err) {
  console.error("DB Error details:", err);  // <-- log the full error
  res.status(500).json({ success: false, message: "Failed to generate OTP" });
}


};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone & OTP required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM otps WHERE phone = $1 ORDER BY created_at DESC LIMIT 1",
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "OTP not found" });
    }

    const latestOtp = result.rows[0];

    // check expiry
    if (new Date() > latestOtp.expires_at) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // check match
    if (latestOtp.otp === otp) {
      return res.json({ success: true, message: "OTP verified" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};

module.exports = { sendOtp, verifyOtp };
