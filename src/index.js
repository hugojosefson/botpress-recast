import R from 'ramda'
import checkVersion from 'botpress-version-manager'
import Recast from './recast'
import {byConfidence, renameSlugToValue} from './transform-intents'

let recast = null

const incomingMiddleware = (event, next) => {
  if (event.type === 'message' || event.type === 'text') {
    if (event.bp.recast.mode === 'understanding') {
      Object.assign(recast.getUserContext(event.user.id).context, {
        botpress_platform: event.platform,
        botpress_type: event.type
      })
      recast.analyseText(event.user.id, event.text)
        .then(({intents, entities, act, sentiment, language}) => {
          event.recast = {
            intents: R.compose(R.sort(byConfidence), R.map(renameSlugToValue), R.defaultTo([]))(intents),
            entities: R.compose(R.map(R.sort(byConfidence)), R.defaultTo({}))(entities),
            act,
            sentiment,
            language,
            context: recast.getUserContext(event.user.id)
          }
          next()
        })
        .catch(err => next(err))
    } else if (event.bp.recast.mode === 'conversation') {
      Object.assign(recast.getUserContext(event.user.id).context, {
        botpress_platform: event.platform,
        botpress_type: event.type
      })

      recast.converseText(event.user.id, event.text)
        .then(({intents, entities, act, sentiment, language, action, replies}) => {
          event.recast = {
            intents: R.compose(R.sort(byConfidence), R.map(renameSlugToValue, R.defaultTo([])))(intents),
            entities: R.compose(R.map(R.sort(byConfidence)), R.defaultTo({}))(entities),
            act,
            sentiment,
            language,
            action,
            replies,
            context: recast.getUserContext(event.user.id)
          }
          // event.bp.logger.verbose(JSON.stringify({intents, replies}, null, 2))
        })
        .catch(err => next(err))
    } else {
      Object.assign(recast.getUserContext(event.user.id).context, {
        botpress_platform: event.platform,
        botpress_type: event.type
      })

      recast.dialogText(event.user.id, event.text)
        .then(({messages, nlp: {intents, entities, act, sentiment, language}}) => {
          event.recast = {
            intents: R.compose(R.sort(byConfidence), R.map(renameSlugToValue, R.defaultTo([])))(intents),
            entities: R.compose(R.map(R.sort(byConfidence)), R.defaultTo({}))(entities),
            act,
            sentiment,
            language,
            replies: messages,
            context: recast.getUserContext(event.user.id)
          }
        })
        .catch(err => next(err))
    }
  } else {
    next()
  }
}

export default {
  config: {
    accessToken: {
      type: 'string',
      required: true,
      env: 'RECAST_TOKEN',
      default: '<YOUR TOKEN HERE>'
    },
    selectedMode: {
      type: 'choice',
      validation: ['understanding', 'conversation', 'dialog'],
      required: true,
      default: 'understanding'
    }
  },

  init: (bp, configurator) => {
    checkVersion(bp, __dirname)

    recast = Recast(bp)

    bp.middlewares.register({
      name: 'recast.incoming',
      module: 'botpress-recast',
      type: 'incoming',
      handler: incomingMiddleware,
      order: 10,
      description: 'Understands entities from incoming message and suggests or executes actions.'
    })

    configurator.loadAll()
      .then(config => recast.setConfiguration(config))
  },

  ready: (bp, configurator) => {
    const router = bp.getRouter('botpress-recast')

    router.get('/config', (req, res) => {
      configurator.loadAll()
        .then(c => res.send(c))
    })

    router.post('/config', (req, res) => {
      const {accessToken, selectedMode} = req.body

      configurator.saveAll({accessToken, selectedMode})
        .then(() => configurator.loadAll())
        .then(c => recast.setConfiguration(c))
        .then(() => res.sendStatus(200))
    })
  }
}
