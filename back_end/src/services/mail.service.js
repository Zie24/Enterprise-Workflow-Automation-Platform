const nodemailer = require("nodemailer");
console.log("MAIL CONFIG:", {
  user: process.env.MAIL_USER,
  hasPass: !!process.env.MAIL_APP_PASSWORD,
});
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true, // يعيد استخدام الاتصال بدل فتح واحد جديد كل مرة
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_APP_PASSWORD, // App Password مش باسورد الجيميل العادي
  },
});

const titles = {
  verify_email: "Verify your email",
  reset_password: "Reset your password",
  login_2fa: "Your login code",
};

const sendOtpMail = async (to, otp, purpose) => {
  await transporter.sendMail({
    from: `"Workflow Platform" <${process.env.MAIL_USER}>`,
    to,
    subject: titles[purpose],
    html: `
      <div style="font-family:Arial;max-width:420px;margin:auto;padding:24px">
        <h2>${titles[purpose]}</h2>
        <p>Use this code. It expires in 10 minutes:</p>
        <h1 style="letter-spacing:8px;color:#4f46e5">${otp}</h1>
        <p style="color:#888">If you didn't request this, ignore this email.</p>
      </div>`,
  });
};

module.exports = { sendOtpMail };