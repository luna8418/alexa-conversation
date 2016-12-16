'use strict';

const assert = require('chai').assert;
const striptags = require('striptags');
const colors = require('colors/safe');
const StackTrace = require('stacktrace-js');
const _ = require('underscore');
const ev = require('./events');
const response = require('./response.js');

function sendEvent(event, app) {
  return new Promise((resolve, reject) => {
    app.handler(event, {
      succeed: resolve,
      fail: reject
    });
  });
}

function errorLogger(reason) {
  console.log(colors.red.underline(`ERROR: ${reason}`));
  StackTrace.fromError(reason).then(console.log);
}

module.exports = function conversation({name, app, appId,
  sessionId = 'SessionId.ee2e2123-75dc-4b32-bf87-8633ba72c294',
  userId = 'amzn1.ask.account.AHEYQEFEHVSPRHPZS4ZKSLDADKC62MMFTEC7MVZ636U56XIFWCFUAJ2Q2RJE47PNDHDBEEMMDTEQXWFSK3OPALF4G2D2QAJW4SDMEI5DCULK5G4R32T76G5SZIWDMJ2ZZQ37UYH2BIXBQ3GIGEBIRW4M4YV5QOQG3JXHB73CTH6AAPYZBOIQE5N3IKUETT54HMTRUX2EILTFGWQ',
  accessToken = '0b42d14150e71fb356f2abc42f5bc261dd18573a86a84aa5d7a74592b505a0b7',
  requestId = 'EdwRequestId.33ac9138-640f-4e6e-ab71-b9619b2c2210',
  locale = 'en-US',
  fuzzyDistance = 0.8
}) {
  ev.init({appId, sessionId, userId, accessToken, requestId, locale});
  // chain of promises to handle the different conversation steps
  const conversationName = name;
  const tests = [];
  let dialog = Promise.resolve(); // start of chain of promises
  let step = -1;
  let isNew = true;

  const api = { // public API
    userSays,
    thenPlainResponse: null, // placeholder
    thenSsmlResponse: null, // placeholder
    end
  };

  // Private

  function printSlots(slots) {
    if (!_.isEmpty(slots)) {
      let res = 'SLOTS: {';
      _.each(slots, (value, key) => {
        res += `${key}: ${value},`;
      });
      return res.substring(0, res.length - 1) + '}';
    }
    return '';
  }

  function executeTestCase(testCase) {
    describe(`User triggers: ${testCase.intentName} ${printSlots(testCase.slots)}`, () => {
      testCase.checks.forEach(check => check(testCase));
    });
  }

  function testConversation() {
    describe(`Conversation: ${conversationName}`, () => {
      tests.forEach(executeTestCase);
    });
  }

  function initStep(i) {
    tests[i] = tests[i] || {checks: []};
  }

  // Public

  function userSays(intentName, slots) {
    step++;
    initStep(step);
    slots = slots || {};
    if (step > 0) isNew = false;
    let index = step;
    dialog = dialog.then(prevEvent =>
      sendEvent(ev.buildRequest(intentName, slots, isNew, prevEvent), app).then(res => {
        tests[index] = _.extend(tests[index], {intentName, slots, actual: res});
        return res;
      })
    ); // return promise already

    const testCase = tests[step];

    api.plainResponse = response.plain(testCase, api, fuzzyDistance);
    api.ssmlResponse = response.ssml(testCase, api);

    return api;
  }

  function end() { // runs the tests stored in `dialog` in seq
    describe('Begin of hack', function() {
      before(() => dialog.then(testConversation).catch(errorLogger));
      it('End of hack', done => done());
      // http://stackoverflow.com/questions/22465431/how-can-i-dynamically-generate-test-cases-in-javascript-node
    });
  }

  return api;
};