const uploadImage = async (z, fileUrl) => {
  const FormData = require('form-data');
  const fetch = require('node-fetch');

  // Use node-fetch directly to get a proper binary buffer
  const fileResponse = await fetch(fileUrl);
  const buffer = await fileResponse.buffer();
  const contentType =
    fileResponse.headers.get('content-type') || 'image/jpeg';

  const form = new FormData();
  form.append('image', buffer, {
    filename: 'image.jpg',
    contentType,
  });

  const uploadResponse = await z.request({
    url: 'https://api.buttondown.com/v1/images',
    method: 'POST',
    headers: form.getHeaders(),
    body: form.getBuffer(),
  });
  return uploadResponse.data.image;
};

const perform = async (z, bundle) => {
  let emailBody = bundle.inputData.body;

  if (bundle.inputData.image_url) {
    const permanentUrl = await uploadImage(z, bundle.inputData.image_url);
    emailBody = `![](${permanentUrl})\n\n${emailBody}`;
  }

  const body = {
    subject: bundle.inputData.subject,
    body: emailBody,
    status: bundle.inputData.publish_date ? 'scheduled' : 'draft',
  };

  if (bundle.inputData.publish_date) {
    body.publish_date = bundle.inputData.publish_date;
  }
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
        key: 'publish_date',
        label: 'Send Date',
        type: 'datetime',
        required: false,
        helpText:
          'If provided, the email will be scheduled to send at this date/time instead of saved as a draft.',
      },
      {
        key: 'image_url',
        label: 'Image',
        type: 'file',
        required: false,
        helpText:
          'An image file to include at the top of the email body. The image will be re-hosted on Buttondown.',
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
