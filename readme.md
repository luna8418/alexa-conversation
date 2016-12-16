# Alexa Conversation: Tests for your Alexa skills

Framework to easily test your Alexa skills functionally by creating a **conversation** with your skill.

## How to use

Create a new file:

```js

const conversation = require('../lib/conversation.js');
const app = require('../../index.js'); // your Alexa skill main file. `app.handle` needs to exist

const opts = {
  name: 'Conversation Name',
  app: app,
  appId: 'your-app-id'
  // Other optional parameters (see below)
};


conversation(opts)
  .userSays('LaunchStubsIntent', {persona: 'someone'})
    plainResponse
      .shouldEqual('Welcome back', 'This is the reprompt')
      .shouldContain('Welcome'); // supports several checks for each reply
  .end(); // this will actually run the conversation defined above

```

This module requires `mocha` as a `peerDependency` (make sure you have it installed either globally or locally: run `npm install mocha -g`). After that just run:

```
mocha {path/to/your/test.js}
```

## API

### `conversation(opts: Object)`

Initializes a new `conversation` and returns itself.

#### Non-optional parameters:

- `name` *String*: The name you want this conversation to have (useful for the test reports)
- `app` *Object*: Your Alexa skill main app object (normally what is returned from your `index.js` file). It needs to expose `app.handle`.
- `appId` *String*: Your Alexa Skill Id in order to build requests that will be accepted by your skill.

#### Optional parameters:

- `sessionId` *String*: Will default to `SessionId.ee2e2123-75dc-4b32-bf87-8633ba72c294` if not provided.
- `userId` *String*: Will default to  `amzn1.ask.account.AHEYQEFEHVSPRHPZS4ZKSLDADKC62MMFTEC7MVZ636U56XIFWCFUAJ2Q2RJE47PNDHDBEEMMDTEQXWFSK3OPALF4G2D2QAJW4SDMEI5DCULK5G4R32T76G5SZIWDMJ2ZZQ37UYH2BIXBQ3GIGEBIRW4M4YV5QOQG3JXHB73CTH6AAPYZBOIQE5N3IKUETT54HMTRUX2EILTFGWQ` if not provided.
- `accessToken` *String*: Will default to  `0b42d14150e71fb356f2abc42f5bc261dd18573a86a84aa5d7a74592b505a0b7` if not provided.
- `requestId` *String*: Will default to  `EdwRequestId.33ac9138-640f-4e6e-ab71-b9619b2c2210` if not provided.
- `locale` *String*: Will default to `en-US` if not provided.

### `userSays(intentName: String, slots: Object)`

Specifies what intent to trigger and the optional slots that it needs.

### `ssmlResponse`

Use this member to add checks to the last `SSML` `response` and `reprompt`.

The `response` is taken form the JSON field: `response.outputSpeech.ssml` and the reprompt form the `response.reprompt.outputSpeech.ssml`

### `plainResponse`

Use this member to add checks to the last `plain text` `response` and reprompt. Plain text is the same as the `ssmlResponse` without the markup tags.

### `shouldApproximate(expectedSpeech: String, expectedReprompt: String, minFuzzyScore: float)`

Will assert that `expectedSpeech` and `expectedReprompt` Strings **are approximately the same** as the ones in `ssmlResponse` or `plainResponse` using **fuzzy string matching**. The default minimum fuzzy score to pass the test is `0.85`, you can override it by passing a new value to the call as the 3rd parameter (accepts values from `[0...1]`).

This check is useful if you want to assert `actual` and `expected` are *the same* but discarding small differences like spaces or punctuation marks like full stops or question marks.

Learn more about the fuzzy matcher used: [fuzzyset.js](http://glench.github.io/fuzzyset.js/)

### `shouldNotApproximate(expectedSpeech: String, expectedReprompt: String, minFuzzyScore: float)`

Will assert that `expectedSpeech` and `expectedReprompt` Strings **are approximately *NOT* the same** as the ones in `ssmlResponse` or `plainResponse` using **fuzzy string matching**. The default minimum fuzzy score to pass the test is `0.85`, you can override it by passing a new value to the call as the 3rd parameter (accepts values from `[0...1]`).

This check is useful if you want to assert `actual` and `expected` are *the same* but discarding small differences like spaces or punctuation marks like full stops or question marks.

Learn more about the fuzzy matcher used: [fuzzyset.js](http://glench.github.io/fuzzyset.js/)

### `shouldEqual(expectedSpeech: String, expectedReprompt: String)`

Will assert that `expectedSpeech` and `expectedReprompt` Strings **equal** the ones in `ssmlResponse` or `plainResponse`.


### `shouldContain(expectedSpeech: String, expectedReprompt: String)`

Will assert that `expectedSpeech` and `expectedReprompt` Strings **are contained** the ones in `ssmlResponse` or `plainResponse`.


### `shouldNotEqual(expectedSpeech: String, expectedReprompt: String)`

Will assert that `expectedSpeech` and `expectedReprompt` Strings **are not equal** to the ones in `ssmlResponse` or `plainResponse`.


### `shouldNotContain(expectedSpeech: String, expectedReprompt: String)`

Will assert that `expectedSpeech` and `expectedReprompt` Strings **are not contained** the ones in `ssmlResponse` or `plainResponse`.


## Debugging & Troubleshooting

To start mocha in debug mode:

```
./node_modules/.bin/mocha debug {path/to/test/file}
```