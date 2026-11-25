// middlewares/upload.js
const multer = require("multer");

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

// memoryStorage: الملف بيفضل في الـ RAM ومش بيتكتب على الديسك إلا بعد ما sharp يتحقق منه
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_SIZE,
    files: 1,
    fields: 0, // مفيش حقول نصية مع الصورة
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG or WebP images are allowed"));
    }
    cb(null, true);
  },
});

// Wrapper عشان أخطاء multer تتحول لرد JSON واضح بدل صفحة error
const uploadAvatarFile = (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 2MB or smaller"
          : "Invalid upload";
      return res.status(400).json({ message });
    }

    return res.status(400).json({ message: err.message });
  });
};

module.exports = { uploadAvatarFile };