const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Otp = require("../models/otp");
const User = require("../models/user");
const { sendOtpMail } = require("../services/mail.service");

const OTP_TTL = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

// Creates an OTP and emails it.
// Returns { ok: true } or { ok: false, wait: seconds }
const createAndSendOtp = async (email, purpose) => {
  const existing = await Otp.findOne({ email, purpose });

  if (existing && Date.now() - existing.lastSentAt < RESEND_COOLDOWN) {
    const wait = Math.ceil(
      (RESEND_COOLDOWN - (Date.now() - existing.lastSentAt)) / 1000
    );
    return { ok: false, wait };
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await bcrypt.hash(otp, 10);

  await Otp.findOneAndUpdate(
    { email, purpose },
    {
      otpHash,
      attempts: 0,
      expiresAt: new Date(Date.now() + OTP_TTL),
      lastSentAt: new Date(),
    },
    { upsert: true, returnDocument: "after" }
  );

  try {
    await sendOtpMail(email, otp, purpose);
  } catch (err) {
    // لو الإيميل فشل نمسح الكود عشان ميتعطلش الـ cooldown
    await Otp.deleteOne({ email, purpose });
    throw err;
  }

  return { ok: true };
};

// POST /otp/send
const sendOtp = async (req, res) => {
  try {
    const { purpose } = req.body;
    const email = req.body.email.toLowerCase();
    const genericResponse = {
      message: "If the email exists, a code has been sent.",
    };

    const user = await User.findOne({ email });
    if (!user) return res.json(genericResponse);

    if (purpose === "verify_email" && user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const result = await createAndSendOtp(email, purpose);
    if (!result.ok) {
      return res
        .status(429)
        .json({ message: `Wait ${result.wait}s before requesting a new code` });
    }

    res.json(genericResponse);
  } catch (err) {
    console.error("Failed to send OTP:", err);
    res.status(500).json({ message: "Failed to send code" });
  }
};

// POST /otp/verify
const verifyOtp = async (req, res) => {
  try {
    const { otp, purpose } = req.body;
    const email = req.body.email.toLowerCase();

    const record = await Otp.findOne({ email, purpose });
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Code expired or not found" });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      await record.deleteOne();
      return res
        .status(429)
        .json({ message: "Too many attempts. Request a new code." });
    }

    const valid = await bcrypt.compare(otp, record.otpHash);
    if (!valid) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({
        message: `Invalid code. ${MAX_ATTEMPTS - record.attempts} attempts left`,
      });
    }

    await record.deleteOne(); // one-time use

    if (purpose === "verify_email") {
      await User.updateOne({ email: record.email }, { isVerified: true });
      return res.json({ message: "Email verified successfully" });
    }

    if (purpose === "reset_password") {
      const resetToken = jwt.sign(
        { email: record.email, purpose: "reset" },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );
      return res.json({ message: "Code verified", resetToken });
    }

    res.json({ message: "Code verified" });
  } catch (err) {
    console.error("Failed to verify OTP:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};

module.exports = { createAndSendOtp, sendOtp, verifyOtp };