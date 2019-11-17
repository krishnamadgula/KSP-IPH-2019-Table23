import React, {Component} from 'react'
import { BaseForm, VALIDATION_TYPES, Textarea } from '../../../components/Form'
import { getMessage } from '../../../lib/translator'
import API from '../../../lib/api'
import ButtonWithOptions from '../../../components/ButtonWithOptions'
import { Popup } from '../../../components/Popup'
import Dialog from '../../../components/Popup/Dialog'

import icon from './icon.svg'
import {format, parse} from 'libphonenumber-js'

import './style.css'

class SmsForm extends BaseForm {
  render () {
    const { SubmitButton } = this.buttons
    const { Form } = this.components
    return (
      <div className='SmsForm'>
        <Form>
          {this.props.formError && <div className='form-error'>{this.props.formError}</div>}
          <Textarea
            label={getMessage('customer.details.sms.message')}
            type='text'
            name='content'
            required
            {...this.generateStateMappers({
              stateKeys: ['message'],
              validationType: VALIDATION_TYPES.ONSUBMIT
            })}
            validationStrings={{
              valueMissing: getMessage('input.requiredMessage')
            }}
          />
          <div className='form-buttons-container'>
            <SubmitButton>{getMessage('customer.details.sms.submitText.send')}</SubmitButton>
          </div>
        </Form>
      </div>
    )
  }
}

class Sms extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: 0,
      showForm: false,
      formError: '',
      message: ''
    }
    this.showPopup = this.showPopup.bind(this)
    this.closePopup = this.closePopup.bind(this)
    this.closeDialog = this.closeDialog.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
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

  componentDidMount () {
    this.getDefaultIndex(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.getDefaultIndex(nextProps)
  }

  getDefaultIndex ({phones, defaultPhoneId}) {
    let index = (defaultPhoneId && phones && phones.length && phones.findIndex(phone => phone.id === defaultPhoneId)) || 0
    index = index > -1 ? index : 0
    this.setState({selected: index})
  }

  handleSubmit (data) {
    const api = new API({url: '/communication-service/SMS'})
    let params = {}
    params['to'] = this.props.phones && !!this.props.phones.length && this.props.phones[this.state.selected] && this.props.phones[this.state.selected].phone
    params['transactional'] = false
    params['type'] = 'no-template'
    params['data'] = {}
    params['data']['content'] = data.message
    return api.post(params).then(
      (response) => {
        this.dialogMessage = getMessage('customer.details.sms.send')
        this.setState({ showForm: false, showDialog: true, formError: '' })
      },
      (error) => {
        this.setState({formError: error.message.split(':')[1]})
        if (Number(error.code) === 401) {
          throw error
        }
      }
    )
  }

  render () {
    let { selected } = this.state
    let { phones } = this.props
    let phone = phones && phones.length && phones[selected] && phones[selected].phone && Object.keys(parse(phones[selected].phone)).length > 0 ? format(parse(phones[selected].phone), 'International') : phones[selected].phone
    let message = getMessage('customer.smsWidget.form.title')
    return (
      <div className='CustomerSmsWidget'>
        <Popup show={this.state.showForm}
          heading={`${message}  ${phone || ''}`}
          close={this.closePopup}
        >
          <SmsForm onSubmit={this.handleSubmit} formError={this.state.formError} />
        </Popup>
        {this.props.showOptions !== false ? (
          <ButtonWithOptions
            options={this.props.phones && this.props.phones.map(({ phone }) => {
              return phone ? Object.keys(parse(phone)).length > 0 ? format(parse(phone), 'International') : phone : null
            }).filter((phone) => phone !== null)}
            selectedOption={this.state.selected}
            onChange={selected => { this.setState({ selected }) }}
            onClick={this.showPopup}
          >
            <img src={icon} alt='Sms' />
          </ButtonWithOptions>
        ) : (
          <button
            className='sms-icon'
            alt='Sms'
            onClick={this.showPopup}
          />
        )}
        <Dialog className='success' show={this.state.showDialog} close={this.closeDialog} message={this.dialogMessage} closeText='OK' />
      </div>
    )
  }
}

Sms.defaultProps = {
  phones: []
}

export default Sms
