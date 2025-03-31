const express = require("express");
const cors = require("cors");
const sendEmail = require("./mailer");

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

app.listen(5000, () =>
  console.log("🚀 Serveur lancé sur http://localhost:5000"),
);
