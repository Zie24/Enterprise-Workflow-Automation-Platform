const router = require('express').Router();
const { sendOtp, verifyOtp } = require('../controllers/otp');
const otpLimiter = require('../middlewares/otpRateLimit');

router.post('/send', otpLimiter, sendOtp);
router.post('/verify', otpLimiter, verifyOtp);

module.exports = router;