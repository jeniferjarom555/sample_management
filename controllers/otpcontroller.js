import pool from "../db.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // Save OTP in DB
    await pool.query(
      "INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)",
      [email, otp, expiresAt]
    );

    // Nodemailer config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // must be App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}: ${otp}`);

    return res.status(200).json({ success: true, message: "OTP saved. Email will be sent shortly." });
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ success: false, message: "Email & OTP required" });

  try {
    const result = await pool.query(
      "SELECT * FROM otps WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) return res.status(400).json({ success: false, message: "OTP not found" });

    const latestOtp = result.rows[0];

    if (new Date() > latestOtp.expires_at) return res.status(400).json({ success: false, message: "OTP expired" });

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
