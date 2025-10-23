import pool from "../db.js";            // Note the .js extension
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();                        // Same effect as require("dotenv").config()


// Send OTP via Email
const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 mins

  try {
    // Save OTP to database
    await pool.query(
      "INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)",
      [email, otp, expiresAt]
    );

    // Configure mail transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code for Login",
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`✅ OTP sent to ${email}: ${otp}`);
    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email & OTP required" });
  }

  try {
    // Get latest OTP for the email
    const result = await pool.query(
      "SELECT * FROM otps WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
      [email]
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
      console.log(`✅ OTP verified for ${email}`);
      return res.status(200).json({ success: true, message: "OTP verified" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (err) {
    console.error("❌ Error verifying OTP:", err);
    return res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};

export default { sendOtp, verifyOtp };
