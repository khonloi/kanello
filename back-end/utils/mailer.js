const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an OTP email to the user
 * @param {string} to - Recipient email address
 * @param {string} otp - The OTP to send
 */
const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Kanello Auth" <noreply@kanello.com>',
    to: to,
    subject: "Your Login Verification Code",
    text: `Your verification code is: ${otp}\nThis code will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Login Verification</h2>
        <p style="color: #555; font-size: 16px;">Hello,</p>
        <p style="color: #555; font-size: 16px;">Your verification code to login to Kanello is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff; background: #f4f4f4; padding: 10px 20px; border-radius: 4px;">
            ${otp}
          </span>
        </div>
        <p style="color: #555; font-size: 16px;">This code will expire in 10 minutes.</p>
        <p style="color: #555; font-size: 14px; margin-top: 40px;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

module.exports = {
  sendOtpEmail,
};
