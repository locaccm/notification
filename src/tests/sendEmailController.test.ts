import { Request, Response } from "express";
import { sendEmailController } from "../controllers/email.controller";
import { sendEmailService } from "../services/mailer.service";
import axios from "axios";

jest.mock("axios");
jest.mock("../services/mailer.service");

describe("Handling email sending via the email controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer mock-token",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return 401 if token is missing", async () => {
    req.headers = {};
    req.body = { to: "", subject: "" };

    await sendEmailController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: missing token",
    });
  });

  it("should return 400 if required fields are missing", async () => {
    req.body = { to: "", subject: "" };

    await sendEmailController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
  });

  it("should return 403 if access is denied", async () => {
    req.body = {
      to: "example@example.com",
      subject: "Test Email",
      text: "Test",
      html: "<p>Test</p>",
    };

    (axios.post as jest.Mock).mockRejectedValue({ response: { status: 403 } });

    await sendEmailController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden: insufficient rights",
    });
  });

  it("should send email successfully and return status 200", async () => {
    req.body = {
      to: "example@example.com",
      subject: "Test Email",
      text: "Test email content",
      html: "<p>Test email content</p>",
    };

    (axios.post as jest.Mock).mockResolvedValue({ status: 201 });
    (sendEmailService as jest.Mock).mockResolvedValue({
      success: true,
      messageId: "abc-123",
    });

    await sendEmailController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith({
      message: "Email sent successfully",
      messageId: "abc-123",
    });
  });

  it("should return 500 if email sending fails", async () => {
    req.body = {
      to: "example@example.com",
      subject: "Test Email",
      text: "Test",
      html: "<p>Test</p>",
    };

    (axios.post as jest.Mock).mockResolvedValue({ status: 201 });
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
      text: "Test",
      html: "<p>Test</p>",
    };

    (axios.post as jest.Mock).mockResolvedValue({ status: 201 });
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

  it("should return 403 and log error if access check throws unexpected error", async () => {
    req.body = {
      to: "example@example.com",
      subject: "Test Email",
      text: "Test",
      html: "<p>Test</p>",
    };

    (axios.post as jest.Mock).mockRejectedValue({
      message: "Unexpected server error",
      response: { status: 500 },
    });

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await sendEmailController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden: insufficient rights",
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "⚠️ Error checking access:",
      "Unexpected server error",
    );

    consoleErrorSpy.mockRestore();
  });
});
