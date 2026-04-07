const performSubscribe = (eventTypes) => async (z, bundle) => {
  const response = await z.request({
    url: 'https://api.buttondown.com/v1/webhooks',
    method: 'POST',
    body: {
      status: 'enabled',
      event_types: eventTypes,
      url: bundle.targetUrl,
      description: 'Zapier trigger',
    },
  });
  return response.data;
};

const performUnsubscribe = async (z, bundle) => {
  await z.request({
    url: `https://api.buttondown.com/v1/webhooks/${bundle.subscribeData.id}`,
    method: 'DELETE',
  });
  return {};
};

module.exports = { performSubscribe, performUnsubscribe };
