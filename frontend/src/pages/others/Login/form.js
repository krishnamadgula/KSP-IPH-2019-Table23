import React from 'react'
import { BaseForm, Input, VALIDATION_TYPES } from '../../../components/Form'
import { withRouter } from 'react-router-dom'
import { getMessage } from '../../../lib/translator'
import { saveSession } from '../../../lib/auth'
import {set, get} from '../../../lib/storage'
import API from '../../../lib/api'
import { roleMapping } from '../../../lib/commonlyused'
import { GOOGLE_MAP_DEFAULT_KEY } from '../../../config/app'

class LoginForm extends BaseForm {
  constructor (props) {
    super(props)
    this.state.values = {
      username: '',
      password: '',
      remember: false
    }
    if (this.props.enterprise) {
      this.state.values.organization = get('organization-name')
    }
    this.state.formError = ''
    this.handleLogin = this.handleLogin.bind(this)
    this.autoFillAction = this.autoFillAction.bind(this)
    this.handleRedirect = this.handleRedirect.bind(this)
  }

  handleLogin (formData) {
    this.api = new API({ url: '/account-service/auth' })
    this.api.post(formData)
      .then((response) => {
        let token = response.data.user.accessToken
        delete response.data.user.accessToken
        saveSession({
          token: token,
          organization: response.data.organization,
          user: response.data.user
        })
        this.setState({ submitting: false }, () => {
          let configApi = new API({ url: '/config-service/config/backOffice' })
          configApi.get().then(
            res => {
              let key = res.data && res.data.backOffice && res.data.backOffice.googleMapsApiKey
              set('googleMapAPIkey', key || GOOGLE_MAP_DEFAULT_KEY)
              this.handleRedirect(response)
            }).catch(error => {
            if (error.code === 401) {
              throw error
            } else {
              set('googleMapAPIkey', GOOGLE_MAP_DEFAULT_KEY)
              this.handleRedirect(response)
            }
          })
        })
      }
      )
      .catch((e) => {
        this.setState({ submitting: false, 'formError': e.message && e.message.split(':')[1] })
      })
  }
  handleRedirect (response) {
    const { history, location } = this.props
    let role = response.data.user.designation && response.data.user.designation.roles && response.data.user.designation.roles[0] ? response.data.user.designation.roles[0] : {}
    let roleObject = roleMapping.find(mapping => mapping.name === role.name)
    let roleRedirect = roleObject ? roleObject.redirect : null
    roleRedirect = roleRedirect || '/employees'
    if (location.state && location.state.from) {
      history.push(location.state.from.pathname)
    } else {
      history.push(roleRedirect)
    }
    this.props.enterprise && set('organization-name', response.data.organization.name)
  }

  onSubmit (data) {
    this.setState({
      submitting: true
    })
    this.handleLogin(data)
  }

  autoFillAction (e) {
    this.setState({ autoFill: true })
  }

  componentDidMount () {
    window.addEventListener('animationstart', this.autoFillAction)
  }

  componentWillUnmount () {
    window.removeEventListener('animationstart', this.autoFillAction)
    this.api && this.api.cancel()
  }

  render () {
    const { SubmitButton } = this.buttons
    const { Form } = this.components
    const { enterprise } = this.props
    return (
      <div>
        {this.state.formError && <div className='form-error'>{this.state.formError}</div>}
        <Form>
          <div className={'username-wrapper' + (enterprise ? '' : ' expand-width')}>
            <Input
              label={enterprise ? getMessage('login.username.heading') : getMessage('login.email.heading')}
              placeholder={enterprise ? getMessage('login.username.placeholder') : getMessage('login.email.placeholder')}
              name='username'
              type={enterprise ? 'text' : 'email'}
              required
              {...this.generateStateMappers({
                stateKeys: ['username'],
                validationType: enterprise ? VALIDATION_TYPES.ONSUBMIT : VALIDATION_TYPES.ONCHANGE
              })}
              validationStrings={{
                valueMissing: getMessage('input.requiredMessage'),
                typeMismatch: enterprise ? getMessage('input.invalidUsernameFormat') : getMessage('input.invalidEmailFormat')
              }}
            />
          </div>
          <Input
            label={getMessage('login.password.heading')}
            placeholder={getMessage('login.password.placeholder')}
            name='password'
            type='password'
            required
            {...this.generateStateMappers({
              stateKeys: ['password'],
              validationType: VALIDATION_TYPES.ONSUBMIT
            })}
            validationStrings={{
              valueMissing: getMessage('input.requiredMessage')
            }}
          />
          <div className='form-buttons-container'>
            {
              enterprise
                ? <SubmitButton disabled={!this.state.autoFill && (this.state.submitting || !this.state.values.username || !this.state.values.organization || !this.state.values.password)}>{getMessage('login.submitText')}</SubmitButton>
                : <SubmitButton disabled={!this.state.autoFill && (this.state.submitting || !this.state.values.username || !this.state.values.password)}>{getMessage('login.submitText')}</SubmitButton>
            }
          </div>
        </Form>
      </div>
    )
  }
}

export default withRouter(LoginForm)
