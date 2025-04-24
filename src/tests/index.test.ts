describe('Integration test for email template rendering and logging', () => {
    it('should generate and log the email HTML with correct content', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        require('../index');

        expect(consoleSpy).toHaveBeenCalled();

        const loggedHtml = consoleSpy.mock.calls[0][0];

        expect(loggedHtml).toContain('Hello Alice');
        expect(loggedHtml).toContain('This is a personalized notification.');
        expect(loggedHtml).toContain('The Locaccm team');

        jest.resetModules();
        consoleSpy.mockRestore();
    });
});