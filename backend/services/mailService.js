// services/mailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends email using Gmail
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 * @param {Array} attachments (optional)
 */
export const sendEmail = async (to, subject, html, attachments = []) => {
  const mailOptions = {
    from: `"Hr Policy App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html, // now using HTML instead of text
    attachments, // support for image or file attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Email failed:", error);
    throw error;
  }
};
