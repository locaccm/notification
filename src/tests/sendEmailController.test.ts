import { Request, Response } from "express";
import { sendEmailController } from "../controllers/email.controller";
import { sendEmailService } from "../services/mailer.service";
import jwt from "jsonwebtoken";

jest.mock("../services/mailer.service");
jest.mock("jsonwebtoken");

describe("sendEmailController", () => {
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

  afterEach(() => {
    jest.clearAllMocks();
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

    (jwt.verify as jest.Mock).mockReturnValue({ status: "TENANT" });

    await sendEmailController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
  });

  it("should return 403 if user is not TENANT or OWNER", async () => {
    req.body = {
      to: "user@example.com",
      subject: "Test Email",
      text: "Body",
    };

    (jwt.verify as jest.Mock).mockReturnValue({ status: "ADMIN" });

    await sendEmailController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden: insufficient rights",
    });
  });

  it("should send email successfully and return 200", async () => {
    req.body = {
      to: "user@example.com",
      subject: "Success Email",
      text: "Email body",
    };

    (jwt.verify as jest.Mock).mockReturnValue({ status: "OWNER" });
    (sendEmailService as jest.Mock).mockResolvedValue({
      success: true,
      messageId: "email-123",
    });

    await sendEmailController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith({
      message: "Email sent successfully",
      messageId: "email-123",
    });
  });

  it("should return 500 if email service fails", async () => {
    req.body = {
      to: "user@example.com",
      subject: "Failure Email",
      text: "Content",
    };

    (jwt.verify as jest.Mock).mockReturnValue({ status: "TENANT" });
    (sendEmailService as jest.Mock).mockResolvedValue({
      success: false,
      error: "SMTP error",
    });

    await sendEmailController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email sending failed",
      details: "SMTP error",
    });
  });

  it("should return 500 if an exception is thrown", async () => {
    req.body = {
      to: "user@example.com",
      subject: "Exception Test",
      text: "Crash!",
    };

    (jwt.verify as jest.Mock).mockReturnValue({ status: "OWNER" });
    (sendEmailService as jest.Mock).mockRejectedValue(
      new Error("Unexpected failure"),
    );

    await sendEmailController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error",
      details: "Unexpected failure",
    });
  });

  it("should return 403 if jwt.verify throws (invalid token)", async () => {
    req.body = {
      to: "user@example.com",
      subject: "Invalid Token",
      text: "Invalid",
    };

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Token verification failed");
    });

    await sendEmailController(req as Request, res as Response);

    expect(consoleSpy).toHaveBeenCalledWith(
      "⚠️ Token verification failed:",
      expect.any(Error),
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden: insufficient rights",
    });

    consoleSpy.mockRestore();
  });
});
