import { generateEmailTemplate } from '../services/emailService';
import { EmailTemplateParams } from '../interfaces/emailTemplateParams';

const normalizeHtml = (html: string) => {
    return html.replace(/\s+/g, ' ').trim(); 
}

describe('generateEmailTemplate', () => {
    it('should generate a valid email template with the provided parameters', () => {
        const params: EmailTemplateParams = {
            recipientName: 'Alice',
            customContent: 'Ceci est une notification personnalisée.',
        };

        const result = generateEmailTemplate(params);

        const expectedHtml = `
            <!DOCTYPE html>
            <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <title>Notification - Locaccm</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f7f9fc;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            background-color: #ffffff;
                            max-width: 600px;
                            margin: 30px auto;
                            padding: 30px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0,0,0,0.05);
                        }
                        h1 {
                            color: #333;
                        }
                        p {
                            font-size: 16px;
                            color: #555;
                        }
                        .signature {
                            margin-top: 30px;
                            font-size: 16px;
                            color: #333;
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 40px;
                            font-size: 12px;
                            color: #999;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Bonjour Alice,</h1>
                        <p>Ceci est une notification personnalisée.</p>
                        <p class="signature">Cordialement,<br>L’équipe Locaccm</p>
                        <div class="footer">
                            © ${new Date().getFullYear()} Locaccm. Tous droits réservés. <br>
                            Cet e-mail vous a été envoyé automatiquement. Merci de ne pas y répondre.
                        </div>
                    </div>
                </body>
            </html>
            `.trim(); 

        expect(normalizeHtml(result)).toEqual(normalizeHtml(expectedHtml));
    });
});
