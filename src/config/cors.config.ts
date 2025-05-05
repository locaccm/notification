import cors, { CorsOptions } from "cors";

// Define allowed origins based on the environment
const allowedOrigins: string[] =
  process.env.NODE_ENV === "development"
    ? ["http://localhost:3000"]
    : ["https://yourdomain.com"];

// CORS configuration options
const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default cors(corsOptions);
