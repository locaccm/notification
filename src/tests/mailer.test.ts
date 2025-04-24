import request from "supertest";
import express, { Request, Response } from "express";
import { sendEmailService } from "../services/mailer.service";

const app = express();

app.use(express.json());

/**
 * Route to handle email sending
 */
app.post("/send-email", async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const result = await sendEmailService(to, subject, text, html);

    if (result.success) {
      res.json({
        message: "Email sent successfully",
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        error: "Failed to send email",
        details: result.error,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

/**
 * Unit tests for the POST /send-email endpoint
 */
describe("POST /send-email endpoint tests", () => {

  it("should send an email successfully", async () => {
    const response = await request(app).post("/send-email").send({
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Text",
      html: "<p>Test HTML</p>",
    });

    if (response.status === 200) {
      expect(response.body.message).toBe("Email sent successfully");
      expect(response.body.messageId).toBeDefined();
    } else {
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to send email");
      expect(response.body.details).toBeDefined();
    }
  });

  it("should return an error if required fields are missing", async () => {
    const response = await request(app).post("/send-email").send({
      to: "",
      subject: "",
      text: "",
      html: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Missing required fields");
  });

  it("should return an error if Nodemailer fails", async () => {
    const response = await request(app).post("/send-email").send({
      to: "invalid-address", 
      subject: "Test Error",
      text: "This should fail",
      html: "<p>Expected error</p>",
    });
  
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Failed to send email");
    expect(response.body.details).toBeDefined();
  });
});
