const authentication = require('./authentication');
const newEmailSent = require('./triggers/newEmailSent');
const newUnsubscribe = require('./triggers/newUnsubscribe');
const createDraft = require('./creates/createDraft');
const createUpdateSubscriber = require('./creates/createUpdateSubscriber');

const addAuthHeader = (request, z, bundle) => {
  request.headers.Authorization = `Token ${bundle.authData.api_key}`;
  return request;
};

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  flags: { cleanInputData: false },

  beforeRequest: [addAuthHeader],

  triggers: {
    [newEmailSent.key]: newEmailSent,
    [newUnsubscribe.key]: newUnsubscribe,
  },

  creates: {
    [createDraft.key]: createDraft,
    [createUpdateSubscriber.key]: createUpdateSubscriber,
  },
};

module.exports = App;
