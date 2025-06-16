import { Request, Response } from "express";
import { sendEmailService } from "../services/mailer.service";
import jwt from "jsonwebtoken";

export function isTenantOrOwner(token: string): boolean {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      status?: string;
    };

    return decoded.status === "TENANT" || decoded.status === "OWNER";
  } catch (error) {
    console.error("⚠️ Token verification failed:", error);
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

  if (!isTenantOrOwner(userToken)) {
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
