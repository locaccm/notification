import express from "express";
import cors from "./config/cors.config";
import emailRoutes from "./routes/email.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { swaggerServe, swaggerSetup } from "./config/swagger.config";
import "./config/env.config";

const app = express();

app.use(cors);
app.use(express.json());

app.use("/api-docs", swaggerServe, swaggerSetup);

app.use("/api", emailRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
