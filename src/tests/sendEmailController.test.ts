// Set AUTH_SERVICE_URL before importing the controller module
process.env.AUTH_SERVICE_URL = "http://auth-service";

import axios from "axios";
import { sendEmailService } from "../services/mailer.service";
import * as EmailController from "../controllers/email.controller";

// Mocks
jest.mock("axios");
jest.mock("../services/mailer.service");

const mockedAxios = axios as jest.Mocked<typeof axios>;
sendEmailService as jest.MockedFunction<typeof sendEmailService>;

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
    const result = await FreshController.hasAccess(token);
    expect(result).toBe(false);
    expect(mockedAxios.post).not.toHaveBeenCalled();
    process.env.AUTH_SERVICE_URL = AUTH_URL;
  });

  it("returns true when TENANT check succeeds", async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    const result = await EmailController.hasAccess(token);
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

    const result = await EmailController.hasAccess(token);
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

    const result = await EmailController.hasAccess(token);
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

    const result = await EmailController.hasAccess(token);
    expect(result).toBe(false);
    expect(spy).toHaveBeenCalledWith(
      "Error checking access:",
      "unexpected error",
    );
  });

  it("returns false if both TENANT and OWNER forbidden", async () => {
    mockedAxios.post.mockRejectedValue({ response: { status: 403 } });

    const result = await EmailController.hasAccess(token);
    expect(result).toBe(false);
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});
