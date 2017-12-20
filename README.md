# botpress-recast

[![Greenkeeper badge](https://badges.greenkeeper.io/hugojosefson/botpress-recast.svg)](https://greenkeeper.io/)

The easiest way to create a Recast.AI bot with Botpress.

## Getting started

```
botpress install recast
```

The Recast.AI module should now be available in your bot UI.

## Features

This module currently only has one mode: **Understanding** (message API / NLP).

### Understanding

This mode will inject understanding metadata inside incoming messages through the Recast.AI middleware.

Events will have a `recast` property populated with the extracted `intents`, `entities`, `act`, `sentiment` and the `context`.

**Tip:** Use this mode if you want to handle the conversation flow yourself and only want to extract entities from incoming text. This is great for programmers.

```js
  bp.hear(
    {'recast.intents[0].value': 'weather'},
    (event, next) => {
      console.log('>> Weather')
      event.reply('#weather')

    }
  )
```


## Community

Pull requests are welcomed! We believe that it takes all of us to create something big and impactful.

There's a [Slack community](https://slack.botpress.io) where you are welcome to join us, ask any question and even help others.

Get an invite and join us now! 👉[https://slack.botpress.io](https://slack.botpress.io)

## License

botpress-recast is licensed under [AGPL-3.0](/LICENSE)
