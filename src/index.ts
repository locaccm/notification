import express from "express";
import cors from "./config/cors.config";
import emailRoutes from "./routes/email.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { swaggerServe, swaggerSetup } from "./config/swagger.config";
import "./config/env.config";

export const app = express();

app.disable("x-powered-by");

app.use(cors);
app.use(express.json());

app.use("/mail-docs", swaggerServe, swaggerSetup);

app.use("/mail", emailRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);
