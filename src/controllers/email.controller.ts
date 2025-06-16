import { Request, Response } from "express";
import { sendEmailService } from "../services/mailer.service";
import axios from "axios";

async function hasAccess(token: string, rightName: string): Promise<boolean> {
  try {
    const response = await axios.post(process.env.AUTH_SERVICE_URL!, {
      token,
      rightName,
    });

    return response.status === 201;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.warn("❌ Access denied");
      return false;
    }
    console.error("⚠️ Error checking access:", error.message);
    return false;
  }
}

// Controller to handle email sending requests
export const sendEmailController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { to, subject, text, html } = req.body;
  const userToken = req.headers.authorization?.split(" ")[1];

  if (!userToken) {
    res.status(401).json({ error: "Unauthorized: missing token" });
    return;
  }

  if (!to || !subject || (!text && !html)) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const authorized = await hasAccess(userToken, "TENANT");
  if (!authorized) {
    res.status(403).json({ error: "Forbidden: insufficient rights" });
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
      res
        .status(500)
        .json({ error: "Email sending failed", details: result.error });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
