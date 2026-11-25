// controllers/settings.js
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const THEMES = ["light", "dark", "system"];

const toSettings = (user) => ({
  avatar: user.avatar ?? "",
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  phone: user.phone ?? "",
  jobTitle: user.jobTitle ?? "",
  preferences: {
    theme: user.preferences?.theme ?? "system",
  },

});

const SELECT = "name email role department phone jobTitle avatar preferences";
// GET /settings
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(SELECT);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(toSettings(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load settings" });
  }
};

// PATCH /settings/profile
const updateProfile = async (req, res) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const phone = String(req.body.phone ?? "").trim();
    const jobTitle = String(req.body.jobTitle ?? "").trim();

    if (name.length < 2 || name.length > 60) {
      return res.status(400).json({ message: "Name must be between 2 and 60 characters" });
    }
    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }
    if (jobTitle.length > 60) {
      return res.status(400).json({ message: "Job title is too long" });
    }

    // نحدّث الحقول المسموحة بس (مفيش email ولا role ولا department)
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { name, phone, jobTitle } },
      { returnDocument: "after", runValidators: true }
    ).select(SELECT);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated", settings: toSettings(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// PATCH /settings/password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }

    const user = await User.findById(req.user.userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (!PASSWORD_RULE.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.",
      });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ message: "New password must be different from the current one" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    // updateOne بدل save عشان ميحصلش hash مرتين لو الموديل فيه pre("save")
    await User.updateOne({ _id: user._id }, { $set: { password: hashed } });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

// PATCH /settings/preferences
const updatePreferences = async (req, res) => {
  try {
    const { theme } = req.body;

    if (!THEMES.includes(theme)) {
      return res.status(400).json({ message: "Invalid theme" });
    }

    await User.updateOne(
      { _id: req.user.userId },
      { $set: { "preferences.theme": theme } }
    );

    res.json({ message: "Preferences updated", preferences: { theme } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update preferences" });
  }
};

module.exports = { getSettings, updateProfile, updatePassword, updatePreferences };