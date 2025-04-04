import { generateEmailTemplate } from '../emailTemplate';

describe('generateEmailTemplate', () => {
  // Mock data to simulate the parameters for the template
  const mockData = {
    recipientName: 'Jean Dupont',
    customContent: 'Votre facture est disponible dans votre espace client.',
  };

  // Test case 1: Check if the recipient's name is included in the greeting
  it('should include the recipient’s name in the greeting', () => {
    const html = generateEmailTemplate(mockData);
    expect(html).toContain(`Bonjour ${mockData.recipientName}`);
  });

  // Test case 2: Check if the custom content is included in the body of the email
  it('should include the custom content in the body', () => {
    const html = generateEmailTemplate(mockData);
    expect(html).toContain(mockData.customContent);
  });

  // Test case 3: Check if the company name (Locaccm) is included in the signature and footer
  it('should include the company name in the signature and footer', () => {
    const html = generateEmailTemplate(mockData);
    expect(html).toContain('L’équipe Locaccm');
    expect(html).toContain('©');
    expect(html).toContain('Locaccm');
  });
});
