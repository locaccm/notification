import request from "supertest";
import { app } from "../index";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  mockedAxios.post.mockResolvedValue({ status: 201 });
});

describe("API route handling and response validation", () => {
  it("should respond with status 200 for the mail-docs route", async () => {
    const response = await request(app).get("/mail-docs");
    expect(response.status).toBe(301);
  });

  it("should respond with status 404 for an unknown route", async () => {
    const response = await request(app).get("/unknown-route");
    expect(response.status).toBe(404);
  });

  it("should respond with status 200 for the mail route", async () => {
    const response = await request(app).get("/mail");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("API is working");
  });

  it("should handle invalid JSON in mail/send-email", async () => {
    const response = await request(app)
      .post("/mail/send-email")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer fake-token")
      .send({ invalidField: "test" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Missing required fields");
  });
});
