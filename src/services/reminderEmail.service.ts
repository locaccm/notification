import { sendEmailService } from "./mailer.service";
import { generateEmailTemplate } from "./email.service";
import { EmailTemplateParams } from "../interfaces/emailTemplateParams.interface";
import { Tenant } from "../interfaces/tenant.interface";

// Send reminder emails to the tenant for each reminder message
export async function sendReminders(reminders: string[], tenant: Tenant) {
  for (const reminder of reminders) {
    const params: EmailTemplateParams = {
      recipientName: tenant.USEC_FNAME + " " + tenant.USEC_LNAME,
      customContent: reminder,
    };

    const html = generateEmailTemplate(params);
    const subject = "⏰ Automatic Reminder";
    const to = tenant.USEC_MAIL;

    await sendEmailService(to, subject, undefined, html);
  }
}
