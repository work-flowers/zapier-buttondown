const perform = async (z, bundle) => {
  const body = {
    subject: bundle.inputData.subject,
    body: bundle.inputData.body,
    status: 'draft',
  };

  if (bundle.inputData.description) {
    body.description = bundle.inputData.description;
  }
  if (bundle.inputData.slug) {
    body.slug = bundle.inputData.slug;
  }

  const response = await z.request({
    url: 'https://api.buttondown.com/v1/emails',
    method: 'POST',
    body,
  });
  return response.data;
};

module.exports = {
  key: 'create_draft',
  noun: 'Draft',
  display: {
    label: 'Create Draft',
    description: 'Creates a new email draft in Buttondown.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'subject',
        label: 'Subject',
        type: 'string',
        required: true,
        helpText: 'The subject line of the email.',
      },
      {
        key: 'body',
        label: 'Body',
        type: 'text',
        required: true,
        helpText:
          'The email body content. Supports both Markdown and HTML (auto-detected by Buttondown).',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'string',
        required: false,
        helpText: 'A short description for the archive/SEO.',
      },
      {
        key: 'slug',
        label: 'Slug',
        type: 'string',
        required: false,
        helpText: 'URL slug for the email archive page (max 100 characters).',
      },
    ],
    sample: {
      id: 'email_00000000-0000-0000-0000-000000000000',
      subject: 'My Draft Email',
      body: '# Hello\n\nThis is a draft.',
      status: 'draft',
      creation_date: '2026-04-06T12:00:00Z',
      description: '',
      slug: 'my-draft-email',
    },
    outputFields: [
      { key: 'id', label: 'Email ID', type: 'string' },
      { key: 'subject', label: 'Subject', type: 'string' },
      { key: 'body', label: 'Body', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'creation_date', label: 'Creation Date', type: 'datetime' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'slug', label: 'Slug', type: 'string' },
    ],
  },
};
