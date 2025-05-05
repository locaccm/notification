import request from "supertest";
import express from "express";
import { errorHandler } from "../middlewares/errorHandler.middleware";

describe("Error handling middleware", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.get("/error", (req, res) => {
      throw new Error("Test error");
    });
    app.use(errorHandler);
  });

  it("should return status 500 and an error message", async () => {
    const response = await request(app).get("/error");
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Something went wrong!");
  });

  it("should log the error stack", async () => {
    const consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    await request(app).get("/error");
    expect(consoleErrorMock).toHaveBeenCalled();
    consoleErrorMock.mockRestore();
  });
});
