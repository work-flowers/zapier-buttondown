const zapier = require('zapier-platform-core');
const App = require('../index');
const appTester = zapier.createAppTester(App);

zapier.tools.env.inject();

describe('creates', () => {
  describe('create_draft', () => {
    it('should create a draft email', async () => {
      const bundle = {
        authData: { api_key: process.env.API_KEY },
        inputData: {
          subject: `Test Draft ${Date.now()}`,
          body: '# Hello\n\nThis is a test draft from Zapier.',
        },
      };
      const result = await appTester(
        App.creates.create_draft.operation.perform,
        bundle
      );
      expect(result).toHaveProperty('id');
      expect(result.status).toBe('draft');
      expect(result.subject).toBe(bundle.inputData.subject);
    });

    it('should set the canonical URL when provided', async () => {
      const canonicalUrl = `https://example.com/post-${Date.now()}`;
      const bundle = {
        authData: { api_key: process.env.API_KEY },
        inputData: {
          subject: `Test Canonical ${Date.now()}`,
          body: '# Hello\n\nThis is a test draft from Zapier.',
          canonical_url: canonicalUrl,
        },
      };
      const result = await appTester(
        App.creates.create_draft.operation.perform,
        bundle
      );
      expect(result).toHaveProperty('id');
      expect(result.canonical_url).toBe(canonicalUrl);
    });

    it('should rehost external markdown images', async () => {
      const externalUrl =
        'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png';
      const bundle = {
        authData: { api_key: process.env.API_KEY },
        inputData: {
          subject: `Test Image Rehost ${Date.now()}`,
          body: `# Hello\n\n![alt text](${externalUrl})\n\nAnd again: ![](${externalUrl})\n`,
        },
      };
      const result = await appTester(
        App.creates.create_draft.operation.perform,
        bundle
      );
      expect(result).toHaveProperty('id');
      expect(result.body).not.toContain('upload.wikimedia.org');
      expect(result.body).toMatch(/!\[alt text\]\(https?:\/\/[^)]+\)/);
    }, 30000);
  });

  describe('create_update_subscriber', () => {
    it('should create or update a subscriber', async () => {
      const bundle = {
        authData: { api_key: process.env.API_KEY },
        inputData: {
          email_address: `test+${Date.now()}@example.com`,
          notes: 'Created by Zapier integration test',
          tags: 'test, zapier',
        },
      };
      const result = await appTester(
        App.creates.create_update_subscriber.operation.perform,
        bundle
      );
      expect(result).toHaveProperty('id');
      expect(result.email_address).toBe(bundle.inputData.email_address);
    });
  });
});
