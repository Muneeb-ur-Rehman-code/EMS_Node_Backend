import transporter from "../config/nodemailer.js";

/**
 * Send Email
 * @param {Object} options
 * @param {String} options.to - Recipient email(s)
 * @param {String} options.subject - Subject of the email
 * @param {String} options.html - HTML body of the email
 * @param {String} [options.from] - Sender email (defaults to EMAIL_USER)
 */
export const sendEmail = async ({ to, subject, html, from }) => {
  try {
    await transporter.sendMail({
      from: from || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to: ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};
