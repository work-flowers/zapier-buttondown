const authentication = {
  type: 'custom',
  fields: [
    {
      key: 'api_key',
      label: 'API Key',
      type: 'string',
      required: true,
      helpText:
        'Find your API key at [buttondown.com/requests](https://buttondown.com/requests).',
    },
  ],
  test: async (z) => {
    const response = await z.request({
      url: 'https://api.buttondown.com/v1/emails',
      params: { page: 1 },
    });
    return response.data;
  },
  connectionLabel: 'Buttondown',
};

module.exports = authentication;
