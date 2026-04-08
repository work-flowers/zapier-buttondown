const perform = async (z, bundle) => {
  const response = await z.request({
    url: `https://api.buttondown.com/v1/subscribers/${bundle.inputData.subscriber_id}`,
  });
  return [response.data];
};

module.exports = {
  key: 'find_subscriber',
  noun: 'Subscriber',
  display: {
    label: 'Find Subscriber',
    description: 'Finds a subscriber by their ID.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'subscriber_id',
        label: 'Subscriber ID',
        type: 'string',
        required: true,
        helpText: 'The Buttondown subscriber ID (e.g. sub_...).',
      },
    ],
    sample: {
      id: 'sub_00000000-0000-0000-0000-000000000000',
      email_address: 'jane@example.com',
      type: 'regular',
      creation_date: '2026-04-06T12:00:00Z',
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
