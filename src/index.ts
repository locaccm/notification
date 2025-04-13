import { generateEmailTemplate } from './services/emailService';
import { EmailTemplateParams } from './interfaces/emailTemplateParams';

const params: EmailTemplateParams = {
    recipientName: 'Alice',
    customContent: 'Ceci est une notification personnalisée.',
};

const emailHtml = generateEmailTemplate(params);
console.log(emailHtml);
