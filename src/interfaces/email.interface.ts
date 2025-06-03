// Defines the structure of an email object
export interface Email {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
