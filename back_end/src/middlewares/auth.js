const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const account = await User.findById(decoded.userId).select(
      "passwordChangedAt isActive"
    );

    if (!account || !account.isActive) {
      return res.status(401).json({ message: "Account not available" });
    }

    // أي token اتعمل قبل تغيير الباسورد يتبطل
    if (
      account.passwordChangedAt &&
      decoded.iat < Math.floor(account.passwordChangedAt.getTime() / 1000)
    ) {
      return res
        .status(401)
        .json({ message: "Password changed. Please log in again." });
    }

    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = auth;