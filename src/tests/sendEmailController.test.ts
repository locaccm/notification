// Set AUTH_SERVICE_URL before importing the controller module
process.env.AUTH_SERVICE_URL = "http://auth-service";

import axios from "axios";
import * as EmailController from "../controllers/email.controller";

jest.mock("axios");
jest.mock("../services/mailer.service");

const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.spyOn(console, "error").mockImplementation(() => {});

const AUTH_URL = process.env.AUTH_SERVICE_URL!;
const token = "test-token";

describe("hasAccess", () => {
  beforeEach(() => {
    mockedAxios.post.mockReset();
    jest.restoreAllMocks();
    process.env.AUTH_SERVICE_URL = AUTH_URL;
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

  it("returns true when createSmtpServer check succeeds", async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });
    const result = await EmailController.hasAccess(token);
    expect(result).toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      AUTH_URL,
      { token, rightName: "createSmtpServer" },
      { headers: { "Content-Type": "application/json" } },
    );
  });

  it("returns false when createSmtpServer check is forbidden (403)", async () => {
    mockedAxios.post.mockRejectedValue({ response: { status: 403 } });
    const result = await EmailController.hasAccess(token);
    expect(result).toBe(false);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it("logs unexpected axios errors", async () => {
    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);
    const error = { response: { status: 500, data: "server error" } };
    const spy = jest.spyOn(console, "error");

    mockedAxios.post.mockRejectedValueOnce(error);

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

    mockedAxios.post.mockRejectedValueOnce(error);

    const result = await EmailController.hasAccess(token);
    expect(result).toBe(false);
    expect(spy).toHaveBeenCalledWith(
      "Error checking access:",
      "unexpected error",
    );
  });
});
