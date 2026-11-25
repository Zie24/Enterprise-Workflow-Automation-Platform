const router = require("express").Router();
const {
  getSettings,
  updateProfile,
  updatePassword,
  updatePreferences,
} = require("../controllers/settings");
const { uploadAvatar, deleteAvatar } = require("../controllers/avatar");
const { uploadAvatarFile } = require("../middlewares/upload");

// استخدمي نفس الـ auth middleware اللي بتستخدميه في routes/user.js و routes/task.js
const auth = require("../middlewares/auth");

router.use(auth);

router.post("/avatar", uploadAvatarFile, uploadAvatar);

router.delete("/avatar", deleteAvatar);
router.get("/", getSettings);
router.patch("/profile", updateProfile);
router.patch("/password", updatePassword);
router.patch("/preferences", updatePreferences);

module.exports = router;

