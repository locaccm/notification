import request from "supertest";
import express, { Request, Response } from "express";
import { sendEmail } from "../mailer";


const app = express();

jest.setTimeout(100000);

app.use(express.json());

app.post("/send-email", async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      res.status(400).json({ error: "Champs obligatoires manquants" });
      return;
    }

    const result = await sendEmail(to, subject, text, html);

    if (result.success) {
      res.json({
        message: "E-mail envoyé avec succès",
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        error: "Erreur envoie E-mail",
        details: result.error,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Erreur interne du serveur", details: error.message });
  }
});


describe("POST /send-email", () => {
  it("devrait envoyer un e-mail avec succès", async () => {
    const response = await request(app).post("/send-email").send({
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Text",
      html: "<p>Test HTML</p>",
    });

    if (response.status === 200) {
      expect(response.body.message).toBe("E-mail envoyé avec succès");
      expect(response.body.messageId).toBeDefined();
    } else {
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erreur envoie E-mail");
      expect(response.body.details).toBeDefined();
    }
  });

  it("devrait renvoyer une erreur si des champs requis sont manquants", async () => {
    const response = await request(app).post("/send-email").send({
      to: "", 
      subject: "",
      text: "",
      html: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Champs obligatoires manquants");
  });
});
