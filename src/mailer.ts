import dotenv from "dotenv";
import nodemailer, { Transporter } from "nodemailer";

// Load environment variables from .env file
dotenv.config();

// Define the email transporter using environment variables
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT), // Ensure the port is a number
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Define the response type for the sendEmail function
interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: any;
}

/**
 * Function to send an email using Nodemailer
 * @param to - Recipient's email address
 * @param subject - Email subject
 * @param text - Plain text version of the email body (optional)
 * @param html - HTML version of the email body (optional)
 * @returns A promise resolving to an EmailResponse object
 */
export const sendEmail = async (
  to: string,
  subject: string,
  text?: string,
  html?: string
): Promise<EmailResponse> => {
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
