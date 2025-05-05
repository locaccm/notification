import { Request, Response } from "express";
import { sendEmailController } from "../controllers/email.controller";
import { sendEmailService } from "../services/mailer.service";

jest.mock("../services/mailer.service");

describe("Handling email sending via the email controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return 400 if required fields are missing", async () => {
    req.body = { to: "", subject: "" };

    await sendEmailController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
  });

  it("should send email successfully and return status 200", async () => {
    req.body = {
      to: "example@example.com",
      subject: "Test Email",
      text: "Test email content",
      html: "<p>Test email content</p>",
    };

    (sendEmailService as jest.Mock).mockResolvedValue({
      success: true,
      messageId: "b6fdd7f4-cb21-4c8a-8c90-ffda5fd9b0f8",
    });

    await sendEmailController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith({
      message: "Email sent successfully",
      messageId: "b6fdd7f4-cb21-4c8a-8c90-ffda5fd9b0f8",
    });
  });

  it("should return 500 if email sending fails", async () => {
    req.body = {
      to: "example@example.com",
      subject: "Test Email",
      text: "Test email content",
      html: "<p>Test email content</p>",
    };

    (sendEmailService as jest.Mock).mockResolvedValue({
      success: false,
      error: "SMTP server error",
    });

    await sendEmailController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email sending failed",
      details: "SMTP server error",
    });
  });

  it("should return 500 if an exception occurs", async () => {
    req.body = {
      to: "example@example.com",
      subject: "Test Email",
      text: "Test email content",
      html: "<p>Test email content</p>",
    };

    (sendEmailService as jest.Mock).mockRejectedValue(
      new Error("Internal error"),
    );

    await sendEmailController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error",
      details: "Internal error",
    });
  });
});
