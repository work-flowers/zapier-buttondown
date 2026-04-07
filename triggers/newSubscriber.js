const { performSubscribe, performUnsubscribe } = require('./webhookHelpers');

const perform = async (z, bundle) => {
  const payload = bundle.cleanedRequest;
  const subscriberId = payload.data.subscriber || payload.data.id;

  const response = await z.request({
    url: `https://api.buttondown.com/v1/subscribers/${subscriberId}`,
  });
  return [response.data];
};

const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://api.buttondown.com/v1/subscribers',
    params: {
      ordering: '-creation_date',
      page: 1,
    },
  });
  return response.data.results;
};

module.exports = {
  key: 'new_subscriber',
  noun: 'Subscriber',
  display: {
    label: 'New Subscriber',
    description: 'Triggers instantly when a new subscriber is created.',
  },
  operation: {
    type: 'hook',
    performSubscribe: performSubscribe(['subscriber.created']),
    performUnsubscribe,
    perform,
    performList,
    sample: {
      id: 'sub_00000000-0000-0000-0000-000000000000',
      email_address: 'jane@example.com',
      type: 'regular',
      creation_date: '2026-04-07T12:00:00Z',
      tags: [],
      metadata: {},
      notes: '',
      source: 'api',
    },
    outputFields: [
      { key: 'id', label: 'Subscriber ID', type: 'string' },
      { key: 'email_address', label: 'Email Address', type: 'string' },
      { key: 'type', label: 'Subscriber Type', type: 'string' },
      { key: 'creation_date', label: 'Subscribed Date', type: 'datetime' },
      { key: 'tags', label: 'Tags', list: true, type: 'string' },
      { key: 'notes', label: 'Notes', type: 'string' },
      { key: 'source', label: 'Source', type: 'string' },
    ],
  },
};
