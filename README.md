# botpress-recast

The easiest way to create a Recast.AI bot with Botpress.

## Getting started

```
botpress install recast
```

The Recast.AI module should now be available in your bot UI.

## Features

This module has two modes: **Understanding** (message API) and **Conversation** (converse API).

### Understanding

This mode will inject understanding metadata inside incoming messages through the Recast.AI middleware.

Events will have a `recast` property populated with the extracted `intents`, `entities`, `act`, `sentiment` and the `context`.

**Tip:** Use this mode if you want to handle the conversation flow yourself and only want to extract entities from incoming text. This is great for programmers.

```js
bp.hear({'recast.entities.intent[0].value': 'weather'}, (event, next) => {
  console.log('>> Weather')
  bp.messenger.sendText(event.user.id, 'Weather intent')
})
```

### Conversation

This mode will run your Recast.AI conversation actions automatically given that you defined the **Actions** in botpress.

Events will have a `recast` property populated with the extracted `intents`, `entities`, `act`, `sentiment`, `action` , `reply` and the `context`.

For more information about Conversations and how they are run, make sure to read [recastai's documentation on conversations](https://github.com/RecastAI/SDK-NodeJS/wiki/Manage-your-conversation).

**Tip:** Use this mode if you created a conversation flow on Recast.AI's User Interface under the *Build* tab, and want it to run automatically in your bot. This is great for non-programmers.

#### Example

```js
// Implement your Conversation Actions like this
bp.recast.actions['getWeather'] = request => {
  return new Promise((resolve, reject) => {
    bp.logger.info('Get Weather called', request)
    // Do something here
    resolve(request.context)
  })
}

// You need to call this method once you are done implementing the Conversation Actions
bp.recast.reinitializeClient()
```


## Community

Pull requests are welcomed! We believe that it takes all of us to create something big and impactful.

There's a [Slack community](https://slack.botpress.io) where you are welcome to join us, ask any question and even help others.

Get an invite and join us now! 👉[https://slack.botpress.io](https://slack.botpress.io)

## License

botpress-recast is licensed under [AGPL-3.0](/LICENSE)
