import nodemailer, { Transporter } from "nodemailer";
import { EmailModel } from "../models/email.model";
import "../config/env.config";

// Define the email transporter using environment variables
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Function to send an email using Nodemailer
 * @param to - Recipient's email address
 * @param subject - Email subject
 * @param text - Plain text version of the email body (optional)
 * @param html - HTML version of the email body (optional)
 * @returns A promise resolving to an EmailResponse object
 */
export const sendEmailService = async (
  to: string,
  subject: string,
  text?: string,
  html?: string,
): Promise<EmailModel> => {
  try {
    const mailOptions = {
      from: '"Test Mailtrap" <test@example.com>',
      to,
      subject,
      text,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error };
  }
};
