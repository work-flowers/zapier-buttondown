const perform = async (z, bundle) => {
  const response = await z.request({
    url: 'https://api.buttondown.com/v1/emails',
    params: {
      status: 'scheduled',
      ordering: '-creation_date',
      page: 1,
    },
  });
  return (response.data.results || [])
    .filter((e) => e.publish_date)
    .map((e) => ({
      ...e,
      email_id: e.id,
      id: `${e.id}:${e.publish_date}`,
    }));
};

module.exports = {
  key: 'new_email_reschedule',
  noun: 'Email Reschedule',
  display: {
    label: 'New Scheduled Email or Reschedule',
    description:
      'Triggers when a scheduled email\'s send date is set or changed. Fires once when an email is first scheduled, and again each time the send date is updated.',
  },
  operation: {
    perform,
    sample: {
      id: 'email_00000000-0000-0000-0000-000000000000:2026-05-20T15:00:00Z',
      email_id: 'email_00000000-0000-0000-0000-000000000000',
      subject: 'My Scheduled Email',
      body: '# Hello\n\nThis is scheduled.',
      status: 'scheduled',
      creation_date: '2026-05-10T12:00:00Z',
      publish_date: '2026-05-20T15:00:00Z',
      description: '',
      slug: 'my-scheduled-email',
    },
    outputFields: [
      { key: 'id', label: 'Event ID', type: 'string' },
      { key: 'email_id', label: 'Email ID', type: 'string' },
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
