// Set AUTH_SERVICE_URL before importing the controller module
process.env.AUTH_SERVICE_URL = "http://auth-service";

import { Request, Response } from "express";
import axios from "axios";
import { sendEmailService } from "../services/mailer.service";
import * as EmailController from "../controllers/email.controller";

const { isTenantOrOwner, sendEmailController } = EmailController;

jest.mock("axios");

// Silence console.error across tests
jest.spyOn(console, "error").mockImplementation(() => {});
jest.mock("../services/mailer.service");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSendEmailService = sendEmailService as jest.MockedFunction<
  typeof sendEmailService
>;

// Tests for isTenantOrOwner

describe("isTenantOrOwner", () => {
  const token = "test-token";
  const AUTH_URL = process.env.AUTH_SERVICE_URL!;

  beforeEach(() => {
    process.env.AUTH_SERVICE_URL = "http://auth-service";
    mockedAxios.post.mockReset();
    jest.restoreAllMocks();
  });

  it("returns false if AUTH_SERVICE_URL is not defined", async () => {
    jest.resetModules();
    delete process.env.AUTH_SERVICE_URL;
    const Fresh = require("../controllers/email.controller");
    const result = await Fresh.isTenantOrOwner(token);
    expect(result).toBe(false);
    expect(mockedAxios.post).not.toHaveBeenCalled();
    process.env.AUTH_SERVICE_URL = AUTH_URL;
    jest.resetModules();
  });

  it("returns true when first right succeeds", async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    await expect(isTenantOrOwner(token)).resolves.toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      AUTH_URL,
      { token, rightName: "TENANT" },
      { headers: { "Content-Type": "application/json" } },
    );
  });

  it("tries OWNER when TENANT is forbidden", async () => {
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

  it("logs unexpected axios errors", async () => {
    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
    const err = { response: { status: 500, data: "bad" } } as any;
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedAxios.post
      .mockRejectedValueOnce(err)
      .mockRejectedValueOnce({ response: { status: 403 } });
    await expect(isTenantOrOwner(token)).resolves.toBe(false);
    expect(spy).toHaveBeenCalledWith(
      "Unexpected error during access check:",
      "bad",
    );
    spy.mockRestore();
  });

  it("logs non-Axios errors", async () => {
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

  it("returns false if all forbidden", async () => {
    mockedAxios.post.mockRejectedValue({ response: { status: 403 } });
    await expect(isTenantOrOwner(token)).resolves.toBe(false);
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});

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
    await sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: missing token",
    });
  });

  it("400 when missing fields", async () => {
    req.headers = { authorization: "Bearer t" };
    req.body = { to: "", subject: "", text: "" };
    await sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
  });

  it("403 when not authorized", async () => {
    spyAccess.mockResolvedValue(false);
    req.headers = { authorization: "Bearer t" };
    req.body = { to: "a", subject: "b", text: "c" };
    await sendEmailController(req as Request, res as Response);
    expect(spyAccess).toHaveBeenCalledWith("t");
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Forbidden: insufficient rights",
    });
  });

  it("succeeds with text only inside try", async () => {
    spyAccess.mockResolvedValue(true);
    mockedSendEmailService.mockResolvedValue({ success: true, messageId: "1" });
    req.headers = { authorization: "Bearer t" };
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
      messageId: "1",
    });
  });

  it("succeeds with html inside try", async () => {
    spyAccess.mockResolvedValue(true);
    mockedSendEmailService.mockResolvedValue({ success: true, messageId: "2" });
    req.headers = { authorization: "Bearer t" };
    req.body = { to: "a", subject: "b", html: "<h>h</h>" };
    await sendEmailController(req as Request, res as Response);
    expect(mockedSendEmailService).toHaveBeenCalledWith(
      "a",
      "b",
      undefined,
      "<h>h</h>",
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Email sent successfully",
      messageId: "2",
    });
  });

  it("handles failure false inside try", async () => {
    spyAccess.mockResolvedValue(true);
    mockedSendEmailService.mockResolvedValue({ success: false, error: "err" });
    req.headers = { authorization: "Bearer t" };
    req.body = { to: "a", subject: "b", text: "c" };
    await sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email sending failed",
      details: "err",
    });
  });

  it("handles exception inside try", async () => {
    spyAccess.mockResolvedValue(true);
    mockedSendEmailService.mockRejectedValue(new Error("e"));
    req.headers = { authorization: "Bearer t" };
    req.body = { to: "a", subject: "b", text: "c" };
    await sendEmailController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error",
      details: "e",
    });
  });
});
