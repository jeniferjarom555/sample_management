const pool = require("./db");

(async () => {
  const phone = "8122761467";
  const otp = "123456";
  const expiresAt = new Date(Date.now() + 10*60*1000);
  try {
    const result = await pool.query(
      "INSERT INTO otps (phone, otp, expires_at) VALUES ($1, $2, $3)",
      [phone, otp, expiresAt]
    );
    console.log("OTP inserted:", result.rowCount);
  } catch (err) {
    console.error("DB error:", err);
  }
})();
