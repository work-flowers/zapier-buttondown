const zapier = require('zapier-platform-core');
const App = require('../index');
const appTester = zapier.createAppTester(App);

zapier.tools.env.inject();

describe('triggers', () => {
  describe('new_email_sent', () => {
    it('should load sent emails', async () => {
      const bundle = { authData: { api_key: process.env.API_KEY } };
      const results = await appTester(
        App.triggers.new_email_sent.operation.perform,
        bundle
      );
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('new_unsubscribe', () => {
    it('should load unsubscribed subscribers', async () => {
      const bundle = { authData: { api_key: process.env.API_KEY } };
      const results = await appTester(
        App.triggers.new_unsubscribe.operation.perform,
        bundle
      );
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
