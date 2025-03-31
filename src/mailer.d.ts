export function sendEmail(
    to: string,
    subject: string,
    text?: string,
    html?: string
): Promise<{ success: boolean; messageId?: string; error?: string }>;