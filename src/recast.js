import moment from 'moment'
import RecastAi from 'recastai'

let latestConfig = null
let client = null

const contexts = {}

const resetContext = userId => {
  contexts[userId] = {
    begin: moment(),
    sessionId: userId + '-' + Math.random().toString().substr(2, 5),
    context: {}
  }
}

const contextExpired = userId => {
  return moment().diff(contexts[userId].begin, 'hours') > 5
}

const getUserContext = userId => {
  if (!contexts[userId] || contextExpired(userId)) {
    resetContext(userId)
  }

  return contexts[userId]
}

const setConfiguration = bp => config => {
  bp.recast.mode = config.selectedMode
  latestConfig = config

  if (bp.recast.mode === 'conversation' && !bp.recast.actions.send) {
    bp.logger.debug('[Recast.AI] In <conversation> mode, Recast must be initialized manually')
    return
  }

  initializeClient(bp, config)
}

const reinitializeClient = bp => () => {
  if (latestConfig) {
    initializeClient(bp, latestConfig)
  }
}

const initializeClient = (bp, config) => {
  client = new RecastAi(config.accessToken)
}

const analyseText = (userId, message) => {
  getUserContext(userId)
  return client.request.analyseText(message)
}

const converseText = (userId, message) => {
  const { sessionId } = getUserContext(userId)
  return client.build.dialog({type: 'text', content: message}, {conversationId: sessionId})
        .then(res => {
          getUserContext(userId).context = res.conversation.memory
          return res
        })
}

const defaultSendAction = bp => ({sessionId, context}, {text, quickreplies}) => {
  return new Promise((resolve, reject) => {
    const userId = sessionId.split('-')[0]
    if (context.botpress_platform === 'facebook') {
      return bp.messenger.sendText(userId, text, { quick_replies: quickreplies })
                .then(() => resolve())
                .catch(reject)
    }
        // default platform
    bp.middlewares.sendOutgoing({
      type: 'text',
      platform: context.botpress_platform,
      text,
      raw: {
        to: userId,
        message: text
      }
    })
  })
}

module.exports = bp => {
  bp.recast = {
    mode: null,
    actions: { send: defaultSendAction(bp) },
    reinitializeClient: reinitializeClient(bp)
  }

  return {
    reinitializeClient: reinitializeClient(bp),
    setConfiguration: setConfiguration(bp),
    analyseText,
    converseText,
    getUserContext
  }
}
