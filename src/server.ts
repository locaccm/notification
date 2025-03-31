import express, { Request, Response } from "express";
import cors from "cors";
import { sendEmail } from "./mailer"; // Assurez-vous que mailer.ts est bien typé

const app = express();

// Disable the "X-Powered-By" header for security reasons
app.disable("x-powered-by");

// Define allowed origins based on the environment
const allowedOrigins: string[] =
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
app.get("/", (req: Request, res: Response): void => {
  res.send("Hello from the Node.js backend!");
});

// Define an endpoint to send emails
app.post("/send-email", async (req: Request, res: Response): Promise<void> => {
  const { to, subject, text, html } = req.body;

  // Validate request body
  if (!to || !subject || (!text && !html)) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
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
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

export default app; // Useful for testing
