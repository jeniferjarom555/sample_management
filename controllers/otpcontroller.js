import { Resend } from "resend";

const resend = new Resend("re_FZfiuYPV_bEzxDp2KdT59XToXiUnRWWCW");

// In-memory OTP store (email → { otp, expiresAt })
const otpStore = new Map();

// ✅ Send OTP
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Expiry 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP in memory
    otpStore.set(email, { otp, expiresAt });

    // Send mail via Resend
    const { data, error } = await resend.emails.send({
      from: "Bethel Lab <noreply@betheldiagnostics.in>",
      to: [email],
      subject: "Your OTP Code",
      html: `<h2>Your OTP is: ${otp}</h2><p>It will expire in 5 minutes.</p>`,
    });

    if (error) {
      console.error("Resend Error:", error);
      return res.status(500).json({ success: false, message: "Failed to send OTP" });
    }

    console.log("✅ OTP Sent:", otp);
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Verify OTP
const verifyOtp = (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ success: false, message: "OTP not found. Please request a new one." });
    }

    const now = new Date();

    if (now > record.expiresAt) {
      otpStore.delete(email); // remove expired OTP
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    if (record.otp.toString() === otp.toString()) {
      otpStore.delete(email); // OTP is used, remove it
      return res.status(200).json({ success: true, message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default { sendOtp, verifyOtp };
