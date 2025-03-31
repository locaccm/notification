const request = require("supertest");
const express = require("express");
const cors = require("cors");
const sendEmail = require("../mailer");
const app = express();

app.disable("x-powered-by");

const allowedOrigins =
  process.env.NODE_ENV === "development"
    ? ["http://localhost:3000"]
    : ["https://yourdomain.com"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello depuis le backend Node.js !");
});

app.post("/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  const result = await sendEmail(to, subject, text, html);

  if (result.success) {
    res.json({
      message: "E-mail envoyé avec succès",
      messageId: result.messageId,
    });
  } else {
    res
      .status(500)
      .json({ error: "Erreur envoie E-mail", details: result.error });
  }
});

// Tests
describe("Test POST /send-email", () => {
  it("should return 400 if required fields are missing", async () => {
    const response = await request(app)
      .post("/send-email")
      .send({ to: "test@example.com", subject: "Test" });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Champs obligatoires manquants");
  });

  it("should return 200 if email is sent successfully", async () => {
    // Mock de la fonction sendEmail pour qu'elle retourne une réponse réussie
    jest.mock("../mailer", () => ({
      sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: "123" }),
    }));

    const response = await request(app)
      .post("/send-email")
      .send({
        to: "test@example.com",
        subject: "Test",
        text: "Test email body",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("E-mail envoyé avec succès");
    expect(response.body.messageId).toBe("123");
  });

  it("should return 500 if email sending fails", async () => {
    // Mock de la fonction sendEmail pour qu'elle retourne une erreur
    jest.mock("../mailer", () => ({
      sendEmail: jest.fn().mockResolvedValue({ success: false, error: "Server error" }),
    }));

    const response = await request(app)
      .post("/send-email")
      .send({
        to: "test@example.com",
        subject: "Test",
        text: "Test email body",
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Erreur envoie E-mail");
    expect(response.body.details).toBe("Server error");
  });
});
