// controllers/avatar.js
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const User = require("../models/user");

const AVATAR_DIR = path.join(__dirname, "..", "..", "uploads", "avatars");
const PUBLIC_PREFIX = "/uploads/avatars/";

// بيمسح الصورة القديمة (وبس لو جوه فولدر الـ avatars)
const removeFile = async (publicPath) => {
  if (!publicPath || !publicPath.startsWith(PUBLIC_PREFIX)) return;

  const filename = path.basename(publicPath); // يمنع path traversal
  try {
    await fs.unlink(path.join(AVATAR_DIR, filename));
  } catch {
    // الملف مش موجود، مش مشكلة
  }
};

// POST /settings/avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // sharp هو التحقق الحقيقي: لو الملف مش صورة فعلاً بيفشل
    // (الـ mimetype اللي بيبعته المتصفح ممكن يتزوّر)
    let output;
    try {
      output = await sharp(req.file.buffer, { limitInputPixels: 24_000_000 })
        .rotate() // يصحح اتجاه صور الموبايل
        .resize(256, 256, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      return res.status(400).json({ message: "File is not a valid image" });
    }

    await fs.mkdir(AVATAR_DIR, { recursive: true });

    // اسم عشوائي من عندنا، مش اسم الملف اللي المستخدم بعته
    const filename = `${req.user.userId}-${Date.now()}.webp`;
    await fs.writeFile(path.join(AVATAR_DIR, filename), output);

    const user = await User.findById(req.user.userId).select("avatar");
    if (!user) {
      await removeFile(PUBLIC_PREFIX + filename);
      return res.status(404).json({ message: "User not found" });
    }

    const oldAvatar = user.avatar;
    const avatar = PUBLIC_PREFIX + filename;

    await User.updateOne({ _id: user._id }, { $set: { avatar } });
    await removeFile(oldAvatar);

    res.json({ message: "Profile photo updated", avatar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload photo" });
  }
};

// DELETE /settings/avatar
const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("avatar");
    if (!user) return res.status(404).json({ message: "User not found" });

    const oldAvatar = user.avatar;
    await User.updateOne({ _id: user._id }, { $set: { avatar: "" } });
    await removeFile(oldAvatar);

    res.json({ message: "Profile photo removed", avatar: "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove photo" });
  }
};

module.exports = { uploadAvatar, deleteAvatar };