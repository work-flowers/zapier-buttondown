const authentication = require('./authentication');
const findSubscriber = require('./searches/findSubscriber');
const createDraft = require('./creates/createDraft');
const createUpdateSubscriber = require('./creates/createUpdateSubscriber');
const newUnsubscribe = require('./triggers/newUnsubscribe');
const newEmailReschedule = require('./triggers/newEmailReschedule');

const addAuthHeader = (request, z, bundle) => {
  if (request.url.startsWith('https://api.buttondown.com/')) {
    request.headers.Authorization = `Token ${bundle.authData.api_key}`;
  }
  return request;
};

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  flags: { cleanInputData: false },

  beforeRequest: [addAuthHeader],

  triggers: {
    [newUnsubscribe.key]: newUnsubscribe,
    [newEmailReschedule.key]: newEmailReschedule,
  },

  searches: {
    [findSubscriber.key]: findSubscriber,
  },

  creates: {
    [createDraft.key]: createDraft,
    [createUpdateSubscriber.key]: createUpdateSubscriber,
  },
};

module.exports = App;
