import { Request, Response } from "express";
import { sendEmailService } from "../services/mailer.service";
import axios from "axios";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

export async function isTenantOrOwner(token: string): Promise<boolean> {
  if (!AUTH_SERVICE_URL) {
    throw new Error("Missing AUTH_SERVICE_URL environment variable");
  }

  const rightsToCheck = ["TENANT", "OWNER"];

  for (const rightName of rightsToCheck) {
    try {
      const response = await axios.post(
        AUTH_SERVICE_URL,
        { token, rightName },
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.status === 200) {
        return true;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status !== 403) {
          console.error(
            "Unexpected error during access check:",
            error.response?.data,
          );
        }
      } else if (error instanceof Error) {
        console.error("Error checking access:", error.message);
      }
    }
  }
  return false;
}

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

  const authorized = await isTenantOrOwner(userToken);
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
