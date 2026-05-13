const { uploadImage, rehostMarkdownImages } = require('../utils/images');

const patchEmail = async (z, emailId, body) =>
  z.request({
    url: `https://api.buttondown.com/v1/emails/${emailId}`,
    method: 'PATCH',
    body,
  });

const perform = async (z, bundle) => {
  const { email_id } = bundle.inputData;
  if (!email_id) throw new Error('Email ID is required.');

  const body = {};

  if (bundle.inputData.body !== undefined && bundle.inputData.body !== '') {
    let emailBody = await rehostMarkdownImages(z, bundle.inputData.body);
    if (bundle.inputData.image_url) {
      const permanentUrl = await uploadImage(z, bundle.inputData.image_url);
      emailBody = `![](${permanentUrl})\n\n${emailBody}`;
    }
    body.body = emailBody;
  } else if (bundle.inputData.image_url) {
    throw new Error(
      'Image was provided but Body was empty. Provide a Body to prepend the image to, or omit the Image.'
    );
  }

  if (bundle.inputData.subject) body.subject = bundle.inputData.subject;
  if (bundle.inputData.description !== undefined)
    body.description = bundle.inputData.description;
  if (bundle.inputData.slug) body.slug = bundle.inputData.slug;

  const reschedule = Boolean(bundle.inputData.publish_date);

  if (reschedule) {
    await patchEmail(z, email_id, { status: 'draft', publish_date: null });
    const finalBody = {
      ...body,
      status: 'scheduled',
      publish_date: bundle.inputData.publish_date,
    };
    const response = await patchEmail(z, email_id, finalBody);
    return response.data;
  }

  if (Object.keys(body).length === 0) {
    throw new Error(
      'Nothing to update. Provide at least one field to change (Subject, Body, Send Date, Description, Slug, or Image).'
    );
  }
  const response = await patchEmail(z, email_id, body);
  return response.data;
};

module.exports = {
  key: 'update_scheduled_email',
  noun: 'Scheduled Email',
  display: {
    label: 'Update Scheduled Email',
    description:
      'Updates an existing draft or scheduled email. Changing the Send Date safely unschedules and reschedules the email so the new time persists.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'email_id',
        label: 'Email ID',
        type: 'string',
        required: true,
        helpText:
          'The Buttondown email ID to update (e.g. from the New Scheduled Email or Reschedule trigger).',
      },
      {
        key: 'subject',
        label: 'Subject',
        type: 'string',
        required: false,
        helpText: 'New subject line. Leave blank to keep the existing subject.',
      },
      {
        key: 'body',
        label: 'Body',
        type: 'text',
        required: false,
        helpText:
          'New email body. Leave blank to keep the existing body. External Markdown images are automatically re-hosted on Buttondown.',
      },
      {
        key: 'publish_date',
        label: 'Send Date',
        type: 'datetime',
        required: false,
        helpText:
          'New scheduled send date/time. Setting this unschedules and reschedules the email so the new time is saved (mirroring the Buttondown UI flow).',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'string',
        required: false,
        helpText: 'New archive/SEO description.',
      },
      {
        key: 'image_url',
        label: 'Image',
        type: 'file',
        required: false,
        helpText:
          'An image to prepend to the new Body. Only applied if Body is also provided.',
      },
      {
        key: 'slug',
        label: 'Slug',
        type: 'string',
        required: false,
        helpText: 'New URL slug for the archive page (max 100 characters).',
      },
    ],
    sample: {
      id: 'email_00000000-0000-0000-0000-000000000000',
      subject: 'My Updated Email',
      body: '# Hello\n\nUpdated content.',
      status: 'scheduled',
      creation_date: '2026-04-06T12:00:00Z',
      publish_date: '2026-05-20T15:00:00Z',
      description: '',
      slug: 'my-updated-email',
    },
    outputFields: [
      { key: 'id', label: 'Email ID', type: 'string' },
      { key: 'subject', label: 'Subject', type: 'string' },
      { key: 'body', label: 'Body', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'creation_date', label: 'Creation Date', type: 'datetime' },
      { key: 'publish_date', label: 'Send Date', type: 'datetime' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'slug', label: 'Slug', type: 'string' },
    ],
  },
};
