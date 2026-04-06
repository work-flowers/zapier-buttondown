const zapier = require('zapier-platform-core');
const App = require('../index');
const appTester = zapier.createAppTester(App);

zapier.tools.env.inject();

describe('authentication', () => {
  it('should authenticate with a valid API key', async () => {
    const bundle = { authData: { api_key: process.env.API_KEY } };
    const result = await appTester(App.authentication.test, bundle);
    expect(result).toHaveProperty('results');
  });
});
