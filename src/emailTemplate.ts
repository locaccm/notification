// Define the shape of the parameters accepted by the template generator
interface EmailTemplateParams {
    recipientName: string;
    customContent: string;
}

// Generates a personalized HTML email template using the provided parameters
export function generateEmailTemplate({ recipientName, customContent }: EmailTemplateParams): string {
    return `
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
                    <!-- Greeting with recipient's name -->
                    <h1>Bonjour ${recipientName},</h1>

                    <!-- Personalized message content -->
                    <p>${customContent}</p>

                    <!-- Email closing with company name -->
                    <p class="signature">Cordialement,<br>L’équipe Locaccm</p>

                    <!-- Footer with automatic disclaimer and copyright -->
                    <div class="footer">
                        © ${new Date().getFullYear()} Locaccm. Tous droits réservés. <br>
                        Cet e-mail vous a été envoyé automatiquement. Merci de ne pas y répondre.
                    </div>
                </div>
            </body>
        </html>
    `;
}
