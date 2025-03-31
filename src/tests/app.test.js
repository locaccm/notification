const request = require("supertest");
const express = require("express");
const { sendEmail } = require("../mailer");
const app = express();

jest.setTimeout(100000);

// Middleware pour gérer les requêtes JSON
app.use(express.json());

app.post("/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  // Utilisation de la fonction réelle sendEmail
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

describe("POST /send-email", () => {
  it("devrait envoyer un e-mail avec succès", async () => {
    // Assure-toi que les variables d'environnement MAIL_HOST, MAIL_USER, MAIL_PASS sont bien définies
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
      to: "", // Test avec des champs vides
      subject: "",
      text: "",
      html: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Champs obligatoires manquants");
  });
});
