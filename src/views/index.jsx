import React from 'react'
import {
  Panel,
  Grid,
  Row,
  Col,
  ControlLabel,
  FormGroup,
  FormControl,
  Alert,
  Button
} from 'react-bootstrap'

import Markdown from 'react-markdown'

import style from './style.scss'

const documentation = {
  understanding: `
  ### Understanding

  This mode will inject understanding metadata inside incoming messages through the Recast.AI middleware.

  Events will have a \`recast\` property populated with the extracted \`entities\` and the \`context\`.

  **Tip:** Use this mode if you want to handle the conversation flow yourself and only want to extract entities from incoming text. This is great for programmers.

  \`\`\`js
  bp.hear({'recast.entities.intent[0].value': 'weather'}, (event, next) => {
    console.log('>> Weather')
    bp.messenger.sendText(event.user.id, 'Weather intent')
  })
  \`\`\`
  `,
  conversation: `### Conversation

  This mode will run your Recast.AI conversation actions automatically given that you defined the **Actions** in botpress.

  For more information about conversations and how they are run, make sure to read [recastai's documentation on conversations](https://github.com/RecastAI/SDK-NodeJS/wiki/Manage-your-conversation).

  **Tip:** Use this mode if you created a conversation flow on Recast.AI's User Interface under the *Build* tab, and want it to run automatically in your bot. This is great for non-programmers.

  #### Example

  \`\`\`js
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
  \`\`\`
  `
}

export default class TemplateModule extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: true,
      message: null,
      initialStateHash: null,
      modes: {
        understanding: 'Understanding mode is...',
        conversation: 'Conversation mode is...',
        dialog: 'Dialog mode is...'
      }
    }

    this.renderAccessToken = this.renderAccessToken.bind(this)
    this.renderRadioButton = this.renderRadioButton.bind(this)

    this.handleAccesTokenChange = this.handleAccesTokenChange.bind(this)
    this.handleSaveChanges = this.handleSaveChanges.bind(this)
    this.handleRadioChange = this.handleRadioChange.bind(this)
  }

  getStateHash () {
    return this.state.accessToken + ' ' + this.state.selectedMode
  }

  getAxios () {
    return this.props.bp.axios
  }

  componentDidMount () {
    this.getAxios().get('/api/botpress-recast/config')
    .then((res) => {
      this.setState({
        loading: false,
        ...res.data
      })

      setImmediate(() => {
        this.setState({ initialStateHash: this.getStateHash() })
      })
    })
  }

  handleAccesTokenChange (event) {
    this.setState({
      accessToken: event.target.value
    })
  }

  handleRadioChange (event) {
    this.setState({
      selectedMode: event.target.value
    })
  }

  handleSaveChanges () {
    this.setState({ loading: true })

    return this.getAxios().post('/api/botpress-recast/config', {
      accessToken: this.state.accessToken,
      selectedMode: this.state.selectedMode
    })
    .then(() => {
      this.setState({
        loading: false,
        initialStateHash: this.getStateHash()
      })
    })
    .catch((err) => {
      this.setState({
        message: {
          type: 'danger',
          text: 'An error occurred while you were trying to save configuration: ' + err.response.data.message
        },
        loading: false,
        initialStateHash: this.getStateHash()
      })
    })
  }

  renderAccessToken () {
    return (
      <Row>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Access Token
          </Col>
          <Col sm={8}>
            <FormControl type='text' value={this.state.accessToken} onChange={this.handleAccesTokenChange} />
          </Col>
        </FormGroup>
      </Row>
    )
  }

  renderRadioButton (label, key, props) {
    return (
      <span className={style.radio} key={key}>
        <label>
          <input type='radio' value={key}
            checked={this.state.selectedMode === key}
            onChange={this.handleRadioChange} />
          {label}
        </label>
      </span>
    )
  }

  renderMode () {
    return (
      <Row>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            Mode
          </Col>
          <Col sm={8}>
            {this.renderRadioButton('Understanding', 'understanding')}
            {this.renderRadioButton('Conversation', 'conversation')}
            {this.renderRadioButton('Dialog', 'dialog')}
          </Col>
        </FormGroup>
      </Row>
    )
  }

  renderExplication () {
    return (
      <Row className={style.explication}>
        <Col sm={12}>
          <Markdown source={documentation[this.state.selectedMode]} />
        </Col>
      </Row>
    )
  }

  renderMessageAlert () {
    return this.state.message
      ? <Alert bsStyle={this.state.message.type}>{this.state.message.text}</Alert>
      : null
  }

  renderSaveButton () {
    const opacityStyle = (this.state.initialStateHash && this.state.initialStateHash !== this.getStateHash())
      ? {opacity: 1}
      : {opacity: 0}

    return <Button style={opacityStyle} bsStyle='success' onClick={this.handleSaveChanges}>Save</Button>
  }

  render () {
    if (this.state.loading) {
      return <h4>Module is loading...</h4>
    }

    return (
      <Grid className={style.recast}>
        <Row>
          <Col md={8} mdOffset={2}>
            {this.renderMessageAlert()}
            <Panel className={style.panel} header='Settings'>
              {this.renderSaveButton()}
              <div className={style.settings}>
                {this.renderAccessToken()}
                {this.renderMode()}
              </div>
            </Panel>
            <Panel header='Documentation'>
              {this.renderExplication()}
            </Panel>
          </Col>
        </Row>
      </Grid>

    )
  }
}
