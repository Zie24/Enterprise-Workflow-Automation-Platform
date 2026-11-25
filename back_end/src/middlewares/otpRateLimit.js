const rateLimit = require("express-rate-limit");

// express-rate-limit v7+: "limit" بدل "max" (القديمة deprecated)
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, try again later" },
});