const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { createAndSendOtp } = require("./otp");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "User account is inactive",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // الباسورد صح بس الإيميل لسه متأكدش
    if (!user.isVerified) {
      // نبعت كود جديد تلقائياً (لو في cooldown مش هيحصل حاجة وده عادي)
      try {
        await createAndSendOtp(user.email, "verify_email");
      } catch (mailError) {
        console.error("Failed to send OTP on login:", mailError);
      }

      return res.status(403).json({
        message: "Please verify your email first",
        needsVerification: true,
        email: user.email,
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    const normalizedEmail = email.toLowerCase();

    // Check if email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (غير متفعل لحد ما يدخل الـ OTP)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      department,
      role: "employee",
      isActive: true,
      isVerified: false,
    });

    // نبعت الـ OTP بعد إنشاء اليوزر
    try {
      await createAndSendOtp(user.email, "verify_email");
    } catch (mailError) {
      // اليوزر اتعمل، بس الإيميل فشل: يقدر يعمل Resend من صفحة الـ verify
      console.error("Failed to send OTP on register:", mailError);
    }

    res.status(201).json({
      message:
        "Registration successful. Please check your email for the verification code.",
      needsVerification: true,
      email: user.email,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
};

// Get current logged-in user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User profile retrieved successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get user profile",
    });
  }
};

module.exports = {
  login,
  register,
  getMe,
};