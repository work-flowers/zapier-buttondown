const perform = async (z, bundle) => {
  const body = {
    email_address: bundle.inputData.email_address,
  };

  if (bundle.inputData.notes) {
    body.notes = bundle.inputData.notes;
  }
  if (bundle.inputData.tags) {
    body.tags = bundle.inputData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (bundle.inputData.metadata) {
    try {
      body.metadata = JSON.parse(bundle.inputData.metadata);
    } catch (e) {
      throw new z.errors.Error(
        'Metadata must be valid JSON (e.g. {"key": "value"}).',
        'InvalidMetadata',
        400
      );
    }
  }

  const response = await z.request({
    url: 'https://api.buttondown.com/v1/subscribers',
    method: 'POST',
    headers: {
      'X-Buttondown-Collision-Behavior': 'overwrite',
      'X-Buttondown-Bypass-Firewall': 'true',
    },
    body,
  });
  return response.data;
};

module.exports = {
  key: 'create_update_subscriber',
  noun: 'Subscriber',
  display: {
    label: 'Create or Update Subscriber',
    description:
      'Creates a new subscriber, or updates an existing one if the email address already exists.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'email_address',
        label: 'Email Address',
        type: 'string',
        required: true,
        helpText: "The subscriber's email address.",
      },
      {
        key: 'notes',
        label: 'Notes',
        type: 'text',
        required: false,
        helpText: 'Private notes about this subscriber.',
      },
      {
        key: 'tags',
        label: 'Tags',
        type: 'string',
        required: false,
        helpText:
          'Comma-separated list of tags. Tags are created automatically if they do not exist.',
      },
      {
        key: 'metadata',
        label: 'Metadata',
        type: 'text',
        required: false,
        helpText:
          'Arbitrary key-value data as a JSON object (e.g. {"company": "Acme"}).',
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
