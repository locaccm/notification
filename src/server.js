const express = require("express");
const cors = require("cors");
const sendEmail = require("./mailer");

const app = express();

// Disable the "X-Powered-By" header for security reasons
app.disable("x-powered-by");

// Define allowed origins based on the environment
const allowedOrigins =
  process.env.NODE_ENV === "development"
    ? ["http://localhost:3000"] // Allow local frontend during development
    : ["https://yourdomain.com"]; // Allow only production domain in production

// Enable CORS with specific configurations
app.use(
  cors({
    origin: allowedOrigins, // Restrict requests to allowed origins
    methods: ["GET", "POST"], // Allow only GET and POST requests
    allowedHeaders: ["Content-Type", "Authorization"], // Define allowed headers
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());

// Define a simple GET route for health check or debugging
app.get("/", (req, res) => {
  res.send("Hello from the Node.js backend!");
});

// Define an endpoint to send emails
app.post("/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;

  // Validate request body
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Attempt to send the email using the sendEmail function
  const result = await sendEmail(to, subject, text, html);

  if (result.success) {
    res.json({
      message: "Email sent successfully",
      messageId: result.messageId,
    });
  } else {
    res.status(500).json({ error: "Email sending failed", details: result.error });
  }
});

// Start the server on port 5000
app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
