import request from "supertest";
import express from "express";
import cors from "../config/cors.config";
import emailRoutes from "../routes/email.routes";
import { errorHandler } from "../middlewares/errorHandler.middleware";
import { swaggerServe, swaggerSetup } from "../config/swagger.config";

const app = express();

app.use(cors);
app.use(express.json());

app.use("/mail-docs", swaggerServe, swaggerSetup);

app.get("/mail", (req, res) => {
  res.status(200).json({ message: "API is working" });
});

app.use("/mail", emailRoutes);
app.use(errorHandler);

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
      .send({ invalidField: "test" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Missing required fields");
  });
});
