const perform = async (z, bundle) => {
  const response = await z.request({
    url: 'https://api.buttondown.com/v1/subscribers',
    params: {
      type: 'unsubscribed',
      ordering: '-unsubscription_date',
      page: 1,
    },
  });
  return response.data.results;
};

module.exports = {
  key: 'new_unsubscribe',
  noun: 'Unsubscribe',
  display: {
    label: 'New Unsubscribe',
    description: 'Triggers when a subscriber unsubscribes.',
  },
  operation: {
    perform,
    sample: {
      id: 'sub_00000000-0000-0000-0000-000000000000',
      email_address: 'jane@example.com',
      type: 'unsubscribed',
      creation_date: '2026-01-01T12:00:00Z',
      unsubscription_date: '2026-04-06T12:00:00Z',
      unsubscription_reason: 'No longer interested',
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
      { key: 'unsubscription_date', label: 'Unsubscribe Date', type: 'datetime' },
      { key: 'unsubscription_reason', label: 'Unsubscribe Reason', type: 'string' },
      { key: 'tags', label: 'Tags', list: true, type: 'string' },
      { key: 'notes', label: 'Notes', type: 'string' },
      { key: 'source', label: 'Source', type: 'string' },
    ],
  },
};
