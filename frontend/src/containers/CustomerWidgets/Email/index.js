import React, { Component } from 'react'
import ButtonWithOptions from '../../../components/ButtonWithOptions'
import { Popup } from '../../../components/Popup'
import { BaseForm, Input, Textarea, VALIDATION_TYPES } from '../../../components/Form'
import { getMessage } from '../../../lib/translator'
import API from '../../../lib/api'
import Dialog from '../../../components/Popup/Dialog'

import icon from './icon.svg'
import './style.css'

class EmailForm extends BaseForm {
  render () {
    let { Form } = this.components
    let { SubmitButton } = this.buttons
    return (
      <Form>
        {this.props.formError && <div className='form-error'>{this.props.formError}</div>}
        <Input
          label={getMessage('customer.emailWidget.form.subject.heading')}
          placeholder={getMessage('customer.emailWidget.form.subject.placeholder')}
          name='subject'
          type='text'
          required
          {...this.generateStateMappers({
            stateKeys: ['subject'],
            validationType: VALIDATION_TYPES.ONSUBMIT,
            loseEmphasisOnFill: true
          })}
          validationStrings={{
            valueMissing: getMessage('input.requiredMessage')
          }}
        />
        <Textarea
          label={getMessage('customer.emailWidget.form.body.heading')}
          placeholder={getMessage('customer.emailWidget.form.body.placeholder')}
          name='body'
          required
          {...this.generateStateMappers({
            stateKeys: ['body'],
            validationType: VALIDATION_TYPES.ONSUBMIT,
            loseEmphasisOnFill: true
          })}
          validationStrings={{
            valueMissing: getMessage('input.requiredMessage')
          }}
        />
        <SubmitButton>{getMessage('customer.emailWidget.form.submitText')}</SubmitButton>
      </Form>
    )
  }
}

class Email extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: 0,
      showForm: false,
      formError: ''
    }
    this.showPopup = this.showPopup.bind(this)
    this.closePopup = this.closePopup.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.closeDialog = this.closeDialog.bind(this)
    this.getDefaultIndex = this.getDefaultIndex.bind(this)
  }
  showPopup () {
    this.setState({ showForm: true })
  }
  closePopup () {
    this.setState({ showForm: false, formError: '' })
  }
  closeDialog () {
    this.setState({ showDialog: false })
  }
  handleSubmit (form) {
    let params = {}
    params.to = this.props.emails && this.props.emails.length && this.props.emails[this.state.selected] && this.props.emails[this.state.selected].email
    params.transactional = false
    params.type = 'no-template'
    params.data = {
      subject: form.subject,
      body: form.body
    }
    let api = new API({ url: '/communication-service/email' })
    return api.post(params)
      .then(
        response => {
          this.dialogMessage = getMessage('customer.details.email.send')
          this.setState({ showForm: false, showDialog: true, formError: '' })
        },
        error => {
          this.setState({formError: error.message.split(':')[1]})
          if (Number(error.code) === 401) {
            throw error
          }
        }
      )
  }

  componentDidMount () {
    this.getDefaultIndex(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.getDefaultIndex(nextProps)
  }

  getDefaultIndex ({emails, defaultEmailId}) {
    let index = (defaultEmailId && emails && emails.length && emails.findIndex(email => email.id === defaultEmailId)) || 0
    index = index > -1 ? index : 0
    this.setState({selected: index})
  }
  render () {
    let { selected } = this.state
    let { emails } = this.props
    let email = emails && emails.length && emails[selected] && emails[selected].email
    let message = getMessage('customer.emailWidget.form.title')
    return (
      <div className='CustomerEmailWidget'>
        <Popup show={this.state.showForm}
          className='CustomerEmailWidgetPopup'
          heading={`${message}  ${email || ''}`}
          close={this.closePopup}
        >
          <EmailForm onSubmit={this.handleSubmit} formError={this.state.formError} />
        </Popup>
        {this.props.showOptions !== false ? (
          <ButtonWithOptions
            options={this.props.emails.map(({ email }) => email)}
            selectedOption={this.state.selected}
            onChange={selected => { this.setState({ selected }) }}
            onClick={this.showPopup}
          >
            <img src={icon} alt='Email' />
          </ButtonWithOptions>
        ) : (
          <button
            className='mail-icon'
            alt='Email'
            onClick={this.showPopup}
          />
        )}
        <Dialog className='success' show={this.state.showDialog} close={this.closeDialog} message={this.dialogMessage} closeText='OK' />
      </div>
    )
  }
}

Email.defaultProps = {
  emails: []
}

export default Email
