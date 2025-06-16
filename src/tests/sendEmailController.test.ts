// Set AUTH_SERVICE_URL before importing the controller module
process.env.AUTH_SERVICE_URL = "http://auth-service";

import { Request, Response } from "express";
import axios from "axios";
import { sendEmailService } from "../services/mailer.service";
import * as EmailController from "../controllers/email.controller";
const { isTenantOrOwner, sendEmailController } = EmailController;

jest.mock("axios");
jest.mock("../services/mailer.service");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSendEmailService = sendEmailService as jest.MockedFunction<
  typeof sendEmailService
>;

describe("isTenantOrOwner", () => {
  const token = "test-token";
  const AUTH_URL = process.env.AUTH_SERVICE_URL!;

  beforeEach(() => {
    mockedAxios.post.mockReset();
    jest.restoreAllMocks();
  });

  it("returns false if AUTH_SERVICE_URL is missing", async () => {
    // Simulate missing URL constant by monkey-patching module constant
    (EmailController as any).AUTH_SERVICE_URL = undefined;
    const result = await isTenantOrOwner(token);
    expect(result).toBe(false);
    expect(mockedAxios.post).not.toHaveBeenCalled();
    // Restore constant
    (EmailController as any).AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
  });

  it("returns true if first right succeeds", async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    await expect(isTenantOrOwner(token)).resolves.toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      AUTH_URL,
      { token, rightName: "TENANT" },
      { headers: { "Content-Type": "application/json" } },
    );
  });

  it("tries second right if first returns 403", async () => {
    mockedAxios.post
      .mockRejectedValueOnce({ response: { status: 403 } })
      .mockResolvedValueOnce({ status: 200 });
    await expect(isTenantOrOwner(token)).resolves.toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      AUTH_URL,
      { token, rightName: "OWNER" },
      { headers: { "Content-Type": "application/json" } },
    );
  });

  it("logs unexpected axios errors not 403", async () => {
    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
    const axiosError = { response: { status: 500, data: "err-data" } } as any;
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedAxios.post
      .mockRejectedValueOnce(axiosError)
      .mockRejectedValueOnce({ response: { status: 403 } });
    await expect(isTenantOrOwner(token)).resolves.toBe(false);
    expect(spy).toHaveBeenCalledWith(
      "Unexpected error during access check:",
      "err-data",
    );
    spy.mockRestore();
  });

  it("logs non-AxiosError errors", async () => {
    jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
    const err = new Error("oops");
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedAxios.post
      .mockRejectedValueOnce(err)
      .mockRejectedValueOnce({ response: { status: 403 } });
    await expect(isTenantOrOwner(token)).resolves.toBe(false);
    expect(spy).toHaveBeenCalledWith("Error checking access:", "oops");
    spy.mockRestore();
  });

  it("returns false if all rights are forbidden", async () => {
    mockedAxios.post.mockRejectedValue({ response: { status: 403 } });
    await expect(isTenantOrOwner(token)).resolves.toBe(false);
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});

describe("sendEmailController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockIsTenantOrOwner: jest.SpyInstance;

  beforeEach(() => {
    req = { headers: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockIsTenantOrOwner = jest.spyOn(EmailController, "isTenantOrOwner");
    jest.clearAllMocks();
    process.env.AUTH_SERVICE_URL = "http://auth-service";
  });

  it("returns 401 if no token", async () => {
    await sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: missing token",
    });
  });

  it("returns 400 if missing fields", async () => {
    req.headers = { authorization: "Bearer token" };
    req.body = { to: "", subject: "", text: "" };
    await sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
  });

  it("returns 403 if not authorized", async () => {
    mockIsTenantOrOwner.mockResolvedValue(false);
    req.headers = { authorization: "Bearer token" };
    req.body = { to: "a", subject: "b", text: "c" };
    await sendEmailController(req as Request, res as Response);
    expect(mockIsTenantOrOwner).toHaveBeenCalledWith("token");
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden: insufficient rights",
    });
  });

  it("sends email and returns success with text", async () => {
    mockIsTenantOrOwner.mockResolvedValue(true);
    mockedSendEmailService.mockResolvedValue({
      success: true,
      messageId: "123",
    });
    req.headers = { authorization: "Bearer token" };
    req.body = { to: "a", subject: "b", text: "c" };
    await sendEmailController(req as Request, res as Response);
    expect(mockedSendEmailService).toHaveBeenCalledWith(
      "a",
      "b",
      "c",
      undefined,
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Email sent successfully",
      messageId: "123",
    });
  });

  it("sends email and returns success with html only", async () => {
    mockIsTenantOrOwner.mockResolvedValue(true);
    mockedSendEmailService.mockResolvedValue({
      success: true,
      messageId: "456",
    });
    req.headers = { authorization: "Bearer token" };
    req.body = { to: "x@x.com", subject: "sub", html: "<p>html</p>" };
    await sendEmailController(req as Request, res as Response);
    expect(mockedSendEmailService).toHaveBeenCalledWith(
      "x@x.com",
      "sub",
      undefined,
      "<p>html</p>",
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Email sent successfully",
      messageId: "456",
    });
  });

  it("handles send failure", async () => {
    mockIsTenantOrOwner.mockResolvedValue(true);
    mockedSendEmailService.mockResolvedValue({ success: false, error: "fail" });
    req.headers = { authorization: "Bearer token" };
    req.body = { to: "a", subject: "b", text: "c" };
    await sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email sending failed",
      details: "fail",
    });
  });

  it("handles exceptions and returns 500", async () => {
    mockIsTenantOrOwner.mockResolvedValue(true);
    mockedSendEmailService.mockRejectedValue(new Error("boom"));
    req.headers = { authorization: "Bearer token" };
    req.body = { to: "a", subject: "b", text: "c" };
    await sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error",
      details: "boom",
    });
  });
});
