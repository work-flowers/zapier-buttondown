const perform = async (z, bundle) => {
  const response = await z.request({
    url: 'https://api.buttondown.com/v1/emails',
    params: {
      status: 'scheduled',
      ordering: '-creation_date',
      page: 1,
    },
  });
  const emails = response.data.results || [];

  let seen = {};
  try {
    const raw = await z.cursor.get();
    if (raw) seen = JSON.parse(raw);
  } catch (e) {
    seen = {};
  }

  const events = [];
  const next = {};
  for (const e of emails) {
    if (!e.publish_date) continue;
    next[e.id] = e.publish_date;
    const prior = seen[e.id];
    if (prior && prior !== e.publish_date) {
      events.push({
        ...e,
        email_id: e.id,
        previous_publish_date: prior,
        id: `${e.id}:${e.publish_date}`,
      });
    }
  }

  await z.cursor.set(JSON.stringify(next));
  return events;
};

module.exports = {
  key: 'new_email_reschedule',
  noun: 'Email Reschedule',
  display: {
    label: 'New Email Reschedule',
    description:
      'Triggers when an existing scheduled email\'s send date is changed. Does not fire on initial scheduling.',
  },
  operation: {
    perform,
    canPaginate: true,
    sample: {
      id: 'email_00000000-0000-0000-0000-000000000000:2026-05-20T15:00:00Z',
      email_id: 'email_00000000-0000-0000-0000-000000000000',
      subject: 'My Scheduled Email',
      body: '# Hello\n\nThis is scheduled.',
      status: 'scheduled',
      creation_date: '2026-05-10T12:00:00Z',
      publish_date: '2026-05-20T15:00:00Z',
      previous_publish_date: '2026-05-15T15:00:00Z',
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
      { key: 'publish_date', label: 'New Send Date', type: 'datetime' },
      {
        key: 'previous_publish_date',
        label: 'Previous Send Date',
        type: 'datetime',
      },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'slug', label: 'Slug', type: 'string' },
    ],
  },
};
