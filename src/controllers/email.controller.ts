import { Request, Response } from "express";
import { sendEmailService } from "../services/mailer.service";

// Controller to handle email sending requests
export const sendEmailController = async (req: Request, res: Response): Promise<void> => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const result = await sendEmailService(to, subject, text, html);

    if (result.success) {
      res.json({
        message: "Email sent successfully",
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({ error: "Email sending failed", details: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};
