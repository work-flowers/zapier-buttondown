const { performSubscribe, performUnsubscribe } = require('./webhookHelpers');

const perform = async (z, bundle) => {
  const payload = bundle.cleanedRequest;
  const emailId = payload.data.email || payload.data.id;

  const response = await z.request({
    url: `https://api.buttondown.com/v1/emails/${emailId}`,
  });
  return [response.data];
};

const performList = async (z, bundle) => {
  const response = await z.request({
    url: 'https://api.buttondown.com/v1/emails',
    params: {
      status: 'sent',
      ordering: '-publish_date',
      page: 1,
    },
  });
  return response.data.results;
};

module.exports = {
  key: 'new_email_sent',
  noun: 'Email',
  display: {
    label: 'New Email Sent',
    description: 'Triggers instantly when a new email is sent to subscribers.',
  },
  operation: {
    type: 'hook',
    performSubscribe: performSubscribe(['email.sent']),
    performUnsubscribe,
    perform,
    performList,
    sample: {
      id: 'email_00000000-0000-0000-0000-000000000000',
      subject: 'My Newsletter Issue #1',
      body: '# Hello\n\nWelcome to my newsletter.',
      status: 'sent',
      publish_date: '2026-04-06T12:00:00Z',
      creation_date: '2026-04-06T11:00:00Z',
      description: '',
      slug: 'my-newsletter-issue-1',
      absolute_url: 'https://buttondown.com/example/archive/my-newsletter-issue-1/',
      email_type: 'public',
    },
    outputFields: [
      { key: 'id', label: 'Email ID', type: 'string' },
      { key: 'subject', label: 'Subject', type: 'string' },
      { key: 'body', label: 'Body', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'publish_date', label: 'Publish Date', type: 'datetime' },
      { key: 'creation_date', label: 'Creation Date', type: 'datetime' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'slug', label: 'Slug', type: 'string' },
      { key: 'absolute_url', label: 'Archive URL', type: 'string' },
      { key: 'email_type', label: 'Email Type', type: 'string' },
    ],
  },
};
