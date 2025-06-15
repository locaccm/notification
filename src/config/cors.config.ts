import cors, { CorsOptions } from "cors";

const originEnv = process.env.CORS_ORIGIN ?? "";
const allowedOrigins = originEnv.split(",");

const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default cors(corsOptions);
