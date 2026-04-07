const zapier = require('zapier-platform-core');
const App = require('../index');
const appTester = zapier.createAppTester(App);

zapier.tools.env.inject();

describe('triggers', () => {
  describe('new_email_sent', () => {
    it('should list sent emails via performList', async () => {
      const bundle = { authData: { api_key: process.env.API_KEY } };
      const results = await appTester(
        App.triggers.new_email_sent.operation.performList,
        bundle
      );
      expect(Array.isArray(results)).toBe(true);
    });

    // Subscribe/unsubscribe requires webhook API access (higher Buttondown tier).
    // Skip unless WEBHOOK_TESTS=1 is set.
    const webhookTest = process.env.WEBHOOK_TESTS === '1' ? it : it.skip;

    webhookTest('should subscribe and unsubscribe a webhook', async () => {
      const bundle = {
        authData: { api_key: process.env.API_KEY },
        targetUrl: 'https://hooks.zapier.com/test/new-email-sent',
      };
      const subscribeResult = await appTester(
        App.triggers.new_email_sent.operation.performSubscribe,
        bundle
      );
      expect(subscribeResult).toHaveProperty('id');

      const unsubscribeBundle = {
        authData: { api_key: process.env.API_KEY },
        subscribeData: { id: subscribeResult.id },
      };
      await appTester(
        App.triggers.new_email_sent.operation.performUnsubscribe,
        unsubscribeBundle
      );
    });
  });

  describe('new_unsubscribe', () => {
    it('should list unsubscribed subscribers via performList', async () => {
      const bundle = { authData: { api_key: process.env.API_KEY } };
      const results = await appTester(
        App.triggers.new_unsubscribe.operation.performList,
        bundle
      );
      expect(Array.isArray(results)).toBe(true);
    });

    const webhookTest = process.env.WEBHOOK_TESTS === '1' ? it : it.skip;

    webhookTest('should subscribe and unsubscribe a webhook', async () => {
      const bundle = {
        authData: { api_key: process.env.API_KEY },
        targetUrl: 'https://hooks.zapier.com/test/new-unsubscribe',
      };
      const subscribeResult = await appTester(
        App.triggers.new_unsubscribe.operation.performSubscribe,
        bundle
      );
      expect(subscribeResult).toHaveProperty('id');

      const unsubscribeBundle = {
        authData: { api_key: process.env.API_KEY },
        subscribeData: { id: subscribeResult.id },
      };
      await appTester(
        App.triggers.new_unsubscribe.operation.performUnsubscribe,
        unsubscribeBundle
      );
    });
  });

  describe('new_subscriber', () => {
    it('should list subscribers via performList', async () => {
      const bundle = { authData: { api_key: process.env.API_KEY } };
      const results = await appTester(
        App.triggers.new_subscriber.operation.performList,
        bundle
      );
      expect(Array.isArray(results)).toBe(true);
    });

    const webhookTest = process.env.WEBHOOK_TESTS === '1' ? it : it.skip;

    webhookTest('should subscribe and unsubscribe a webhook', async () => {
      const bundle = {
        authData: { api_key: process.env.API_KEY },
        targetUrl: 'https://hooks.zapier.com/test/new-subscriber',
      };
      const subscribeResult = await appTester(
        App.triggers.new_subscriber.operation.performSubscribe,
        bundle
      );
      expect(subscribeResult).toHaveProperty('id');

      const unsubscribeBundle = {
        authData: { api_key: process.env.API_KEY },
        subscribeData: { id: subscribeResult.id },
      };
      await appTester(
        App.triggers.new_subscriber.operation.performUnsubscribe,
        unsubscribeBundle
      );
    });
  });
});
