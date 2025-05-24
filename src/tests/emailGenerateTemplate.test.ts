import { generateEmailTemplate } from "../services/email.service";

describe("HTML email content generation and formatting", () => {
  const mockData = {
    recipientName: "Jean Dupont",
    customContent: "Your invoice is available in your customer area.",
  };

  it("should include the recipient’s name in the greeting", () => {
    const html = generateEmailTemplate(mockData);
    expect(html).toContain(`Hello ${mockData.recipientName}`);
  });

  it("should include the custom content in the body", () => {
    const html = generateEmailTemplate(mockData);
    expect(html).toContain(mockData.customContent);
  });

  it("should include the company name in the signature and footer", () => {
    const html = generateEmailTemplate(mockData);
    expect(html).toContain("The Locaccm team");
    expect(html).toContain("©");
    expect(html).toContain("Locaccm");
  });
});
