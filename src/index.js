import R from 'ramda'
import checkVersion from 'botpress-version-manager'
import CircularJSON from 'circular-json'
import Recast from './recast'
import {byConfidence, renameSlugToValue} from './transform-intents'

let recast = null

const incomingMiddleware = (event, next) => {
  if (event.type === 'message' || event.type === 'text') {
    event.bp.logger.verbose(`[Recast.AI].incomingMiddleware: event = ${CircularJSON.stringify(event, null, 2)}`)
    if (event.bp.recast.mode === 'understanding') {
      Object.assign(recast.getUserContext(event.user.id).context, {
        botpress_platform: event.platform,
        botpress_type: event.type
      })
      recast.analyseText(event.user.id, event.text)
        .then(result => {
          event.bp.logger.verbose(`[Recast.AI].recast.analyseText: result = ${CircularJSON.stringify(result, null, 2)}`)
          return result
        })
        .then(({intents, entities, act, sentiment, language}) => {
          event.recast = {
            intents: R.compose(R.sort(byConfidence), R.map(renameSlugToValue), R.defaultTo([]))(intents),
            entities: R.compose(R.map(R.sort(byConfidence)), R.defaultTo({}))(entities),
            act,
            sentiment,
            language,
            context: recast.getUserContext(event.user.id)
          }
          event.bp.logger.verbose(`[Recast.AI].analyseText: event.recast = ${CircularJSON.stringify(event.recast, null, 2)}`)
          next()
        })
        .catch(err => next(err))
    } else {
      Object.assign(recast.getUserContext(event.user.id).context, {
        botpress_platform: event.platform,
        botpress_type: event.type
      })

      recast.converseText(event.user.id, event.text)
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
          event.bp.logger.verbose(`[Recast.AI].converseText: event.recast = ${CircularJSON.stringify(event.recast, null, 2)}`)
        })
        .catch(err => next(err))
    }
  } else {
    event.bp.logger.warn(`[Recast.AI].incomingMiddleware: event = ${CircularJSON.stringify(event, null, 2)}`)
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
      validation: ['understanding', 'conversation'],
      required: true,
      default: 'understanding'
    }
  },

  init: (bp, configurator) => {
    bp.logger.debug('init')
    checkVersion(bp, __dirname)

    recast = Recast(bp)

    bp.logger.debug('Registering')
    bp.middlewares.register({
      name: 'recast.incoming',
      module: 'botpress-recast',
      type: 'incoming',
      handler: incomingMiddleware,
      order: 10,
      description: 'Understands entities from incoming message and suggests or executes actions.'
    })

    bp.logger.debug('Configuring')
    configurator.loadAll()
      .then(config => recast.setConfiguration(config))
  },

  ready: (bp, configurator) => {
    bp.logger.debug('Ready')
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
