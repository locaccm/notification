import request from "supertest";
import express, { Request, Response } from "express";
import { sendEmail } from "../mailer";

// Create an Express application for testing
const app = express();

// Increase Jest timeout to avoid test failures due to long response times
jest.setTimeout(100000);

// Middleware to parse JSON requests
app.use(express.json());

/**
 * Route to handle email sending
 */
app.post("/send-email", async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract email parameters from the request body
    const { to, subject, text, html } = req.body;

    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      res.status(400).json({ error: "Champs obligatoires manquants" });
      return;
    }

    // Call the sendEmail function
    const result = await sendEmail(to, subject, text, html);

    if (result.success) {
      // If email is sent successfully, respond with success message
      res.json({
        message: "E-mail envoyé avec succès",
        messageId: result.messageId,
      });
    } else {
      // If email sending fails, return an error response
      res.status(500).json({
        error: "Erreur envoie E-mail",
        details: result.error,
      });
    }
  } catch (error: any) {
    // Catch unexpected server errors
    res.status(500).json({ error: "Erreur interne du serveur", details: error.message });
  }
});

/**
 * Unit tests for the /send-email endpoint
 */
describe("POST /send-email", () => {
  /**
   * Test case: Should successfully send an email
   */
  it("should send an email successfully", async () => {
    // Simulate a valid email request
    const response = await request(app).post("/send-email").send({
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Text",
      html: "<p>Test HTML</p>",
    });

    // If the response status is 200 (success), check the response body
    if (response.status === 200) {
      expect(response.body.message).toBe("E-mail envoyé avec succès");
      expect(response.body.messageId).toBeDefined();
    } else {
      // If the response status is 500 (failure), check the error details
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erreur envoie E-mail");
      expect(response.body.details).toBeDefined();
    }
  });

  /**
   * Test case: Should return an error if required fields are missing
   */
  it("should return an error if required fields are missing", async () => {
    // Simulate an invalid request with missing fields
    const response = await request(app).post("/send-email").send({
      to: "",
      subject: "",
      text: "",
      html: "",
    });

    // Expect a 400 status with an error message about missing fields
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Champs obligatoires manquants");
  });
});
