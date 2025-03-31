// Load environment variables from .env file
require("dotenv").config();

const nodemailer = require("nodemailer");

// Create a transporter object using the SMTP configuration from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, 
  },
});

/**
 * Function to send an email using Nodemailer
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text version of the email body (optional)
 * @param {string} html - HTML version of the email body (optional)
 * @returns {Promise<{ success: boolean, messageId?: string, error?: any }>}
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: '"Test Mailtrap" <test@example.com>', 
      to, 
      subject,
      text, 
      html, 
    };

    // Send the email using the configured transporter
    const info = await transporter.sendMail(mailOptions);
    
    // Return success response with message ID
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Return error response in case of failure
    return { success: false, error };
  }
};

// Export the sendEmail function for use in other files
module.exports = { sendEmail };
