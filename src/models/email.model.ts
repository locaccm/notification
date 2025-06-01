// Defines the structure of the response returned after attempting to send an email
export interface EmailModel {
  success: boolean;
  messageId?: string;
  error?: any;
}
