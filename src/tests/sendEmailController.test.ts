// Set AUTH_SERVICE_URL before importing the controller module
process.env.AUTH_SERVICE_URL = "http://auth-service";

import { Request, Response } from "express";
import axios from "axios";
import { sendEmailService } from "../services/mailer.service";
import * as EmailController from "../controllers/email.controller";

// Mocks
jest.mock("axios");
jest.mock("../services/mailer.service");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSendEmailService = sendEmailService as jest.MockedFunction<
  typeof sendEmailService
>;

// Silence console.error globally in test
jest.spyOn(console, "error").mockImplementation(() => {});

const AUTH_URL = process.env.AUTH_SERVICE_URL!;
const token = "test-token";

// Tests for isTenantOrOwner
describe("isTenantOrOwner", () => {
  beforeEach(() => {
    mockedAxios.post.mockReset();
    jest.restoreAllMocks();
    process.env.AUTH_SERVICE_URL = "http://auth-service";
  });

  it("returns false if AUTH_SERVICE_URL is not defined", async () => {
    jest.resetModules();
    delete process.env.AUTH_SERVICE_URL;
    const FreshController = require("../controllers/email.controller");
    const result = await FreshController.isTenantOrOwner(token);
    expect(result).toBe(false);
    expect(mockedAxios.post).not.toHaveBeenCalled();
    process.env.AUTH_SERVICE_URL = AUTH_URL;
  });

  it("returns true when TENANT check succeeds", async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    const result = await EmailController.isTenantOrOwner(token);
    expect(result).toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      AUTH_URL,
      { token, rightName: "TENANT" },
      { headers: { "Content-Type": "application/json" } },
    );
  });

  it("tries OWNER if TENANT is forbidden", async () => {
    mockedAxios.post
      .mockRejectedValueOnce({ response: { status: 403 } })
      .mockResolvedValueOnce({ status: 200 });

    const result = await EmailController.isTenantOrOwner(token);
    expect(result).toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      AUTH_URL,
      { token, rightName: "OWNER" },
      { headers: { "Content-Type": "application/json" } },
    );
  });

  it("logs unexpected axios errors", async () => {
    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
    const error = { response: { status: 500, data: "server error" } };
    const spy = jest.spyOn(console, "error");

    mockedAxios.post
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce({ response: { status: 403 } });

    const result = await EmailController.isTenantOrOwner(token);
    expect(result).toBe(false);
    expect(spy).toHaveBeenCalledWith(
      "Unexpected error during access check:",
      "server error",
    );
  });

  it("logs non-axios errors", async () => {
    jest.spyOn(axios, "isAxiosError").mockReturnValue(false);
    const error = new Error("unexpected error");
    const spy = jest.spyOn(console, "error");

    mockedAxios.post
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce({ response: { status: 403 } });

    const result = await EmailController.isTenantOrOwner(token);
    expect(result).toBe(false);
    expect(spy).toHaveBeenCalledWith(
      "Error checking access:",
      "unexpected error",
    );
  });

  it("returns false if both TENANT and OWNER forbidden", async () => {
    mockedAxios.post.mockRejectedValue({ response: { status: 403 } });

    const result = await EmailController.isTenantOrOwner(token);
    expect(result).toBe(false);
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});
/*
// Tests for sendEmailController
describe("sendEmailController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let spyAccess: jest.SpyInstance;

  beforeEach(() => {
    req = { headers: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    spyAccess = jest.spyOn(EmailController, "isTenantOrOwner");
    jest.clearAllMocks();
  });

  it("401 when no token", async () => {
    await EmailController.sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: missing token",
    });
  });

  it("400 when missing required fields", async () => {
    req.headers = { authorization: "Bearer t" };
    req.body = { to: "", subject: "", text: "" };

    await EmailController.sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
  });

  it("403 when not authorized", async () => {
    spyAccess.mockResolvedValue(false);
    req.headers = { authorization: "Bearer t" };
    req.body = { to: "a", subject: "b", text: "c" };

    await EmailController.sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden: insufficient rights",
    });
  });

  it("200 success with text email", async () => {
    spyAccess.mockResolvedValue(true);
    mockedSendEmailService.mockResolvedValue({ success: true, messageId: "1" });

    req.headers = { authorization: "Bearer t" };
    req.body = { to: "a", subject: "b", text: "c" };

    await EmailController.sendEmailController(req as Request, res as Response);
    expect(mockedSendEmailService).toHaveBeenCalledWith("a", "b", "c", undefined);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email sent successfully",
      messageId: "1",
    });
  });

  it("200 success with html email", async () => {
    spyAccess.mockResolvedValue(true);
    mockedSendEmailService.mockResolvedValue({ success: true, messageId: "2" });

    req.headers = { authorization: "Bearer t" };
    req.body = { to: "a", subject: "b", html: "<h>html</h>" };

    await EmailController.sendEmailController(req as Request, res as Response);
    expect(mockedSendEmailService).toHaveBeenCalledWith("a", "b", undefined, "<h>html</h>");
    expect(res.json).toHaveBeenCalledWith({
      message: "Email sent successfully",
      messageId: "2",
    });
  });

  it("500 when sendEmailService returns failure", async () => {
    spyAccess.mockResolvedValue(true);
    mockedSendEmailService.mockResolvedValue({ success: false, error: "err" });

    req.headers = { authorization: "Bearer t" };
    req.body = { to: "a", subject: "b", text: "c" };

    await EmailController.sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email sending failed",
      details: "err",
    });
  });

  it("500 on exception thrown by sendEmailService", async () => {
    spyAccess.mockResolvedValue(true);
    mockedSendEmailService.mockRejectedValue(new Error("e"));

    req.headers = { authorization: "Bearer t" };
    req.body = { to: "a", subject: "b", text: "c" };

    await EmailController.sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error",
      details: "e",
    });
  });
});*/
