import express from "express";
import cors from "./config/cors.config";
import emailRoutes from "./routes/email.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { swaggerServe, swaggerSetup } from "./config/swagger.config";
import { generateEmailTemplate } from './services/emailService';
import { EmailTemplateParams } from './interfaces/emailTemplateParams';
import "./config/env.config";
import { checkDailyReminders } from './services/reminderService';

const app = express();

app.use(cors);
app.use(express.json());

app.use("/mail-docs", swaggerServe, swaggerSetup);

app.use("/mail", emailRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT);


export const params: EmailTemplateParams = {
    recipientName: 'Alice',
    customContent: 'This is a personalized notification.',
};

const emailHtml = generateEmailTemplate(params);
console.log(emailHtml);

checkDailyReminders();
