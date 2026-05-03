const zapier = require('zapier-platform-core');
const App = require('../index');
const appTester = zapier.createAppTester(App);

zapier.tools.env.inject();

describe('triggers', () => {
  describe('new_unsubscribe', () => {
    it('should load unsubscribed subscribers', async () => {
      const bundle = { authData: { api_key: process.env.API_KEY } };
      const results = await appTester(
        App.triggers.new_unsubscribe.operation.perform,
        bundle
      );
      expect(Array.isArray(results)).toBe(true);
      results.forEach((r) => {
        expect(r).toHaveProperty('id');
        expect(r).toHaveProperty('subscriber_id');
        expect(r.id).toContain(':');
      });
    });
  });
});
