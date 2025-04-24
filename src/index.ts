import { generateEmailTemplate } from './services/emailService';
import { EmailTemplateParams } from './interfaces/emailTemplateParams';

const params: EmailTemplateParams = {
    recipientName: 'Alice',
    customContent: 'This is a personalized notification.',
};

const emailHtml = generateEmailTemplate(params);
console.log(emailHtml);
