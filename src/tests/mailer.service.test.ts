const sendMailMock = jest.fn();

jest.mock("nodemailer", () => {
  const actual = jest.requireActual("nodemailer");
  return {
    ...actual,
    createTransport: jest.fn(() => ({
      sendMail: sendMailMock,
    })),
  };
});

import { sendEmailService } from "../services/mailer.service";

describe("SendEmailService correctly handles successful and failed email sending scenarios", () => {
  beforeEach(() => {
    sendMailMock.mockReset();
  });

  it("should return success true and a messageId on successful email send", async () => {
    const mockMessageId = "mock-message-id-123";
    sendMailMock.mockResolvedValueOnce({ messageId: mockMessageId });

    const result = await sendEmailService(
      "test@example.com",
      "Subject",
      "Text body",
      "<p>HTML body</p>",
    );

    expect(result).toEqual({
      success: true,
      messageId: mockMessageId,
    });
    expect(sendMailMock).toHaveBeenCalled();
  });

  it("should return success false and an error on failure", async () => {
    const error = new Error("SMTP error");
    sendMailMock.mockRejectedValueOnce(error);

    const result = await sendEmailService(
      "fail@example.com",
      "Subject",
      "Text",
      "<p>HTML</p>",
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
    expect(sendMailMock).toHaveBeenCalled();
  });
});
