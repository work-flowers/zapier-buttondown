const uploadImage = async (z, imageUrl) => {
  const downloadResponse = await z.request({
    url: imageUrl,
    raw: true,
  });
  const buffer = await downloadResponse.buffer();

  const filename =
    imageUrl.split('/').pop().split('?')[0] || 'image.jpg';
  const FormData = require('form-data');
  const form = new FormData();
  form.append('image', buffer, { filename });

  const uploadResponse = await z.request({
    url: 'https://api.buttondown.com/v1/images',
    method: 'POST',
    headers: form.getHeaders(),
    body: form,
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
        label: 'Image URL',
        type: 'string',
        required: false,
        helpText:
          'URL of an image to include at the end of the email body. The image will be downloaded and re-hosted on Buttondown so temporary URLs (e.g. pre-signed S3 links) will keep working.',
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
