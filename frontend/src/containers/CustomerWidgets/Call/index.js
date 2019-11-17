import React, { Component } from 'react'
import ButtonWithOptions from '../../../components/ButtonWithOptions'
import { Popup } from '../../../components/Popup'
import { BaseForm, Select, Textarea, VALIDATION_TYPES } from '../../../components/Form'
import { getMessage } from '../../../lib/translator'
import API from '../../../lib/api'
import Dialog from '../../../components/Popup/Dialog'

import icon from './icon.svg'
import {format, parse} from 'libphonenumber-js'

import './style.css'

class CallForm extends BaseForm {
  render () {
    let { Form } = this.components
    let { SubmitButton } = this.buttons
    return (
      <Form>
        {this.props.formError && <div className='form-error'>{this.props.formError}</div>}
        <Select
          label={getMessage('customer.callWidget.form.reason.heading')}
          placeholder={getMessage('customer.callWidget.form.reason.placeholder')}
          name='reason'
          type='text'
          required
          options={[
            getMessage('customer.callWidget.form.reason.lateDelivery'),
            getMessage('customer.callWidget.form.reason.orderEdit'),
            getMessage('customer.callWidget.form.reason.paymentReminder'),
            getMessage('customer.callWidget.form.reason.rescheduling'),
            getMessage('customer.callWidget.form.reason.orderConfirmation'),
            getMessage('customer.callWidget.form.reason.missedCallback'),
            getMessage('customer.callWidget.form.reason.addressClarifiation'),
            getMessage('customer.callWidget.form.reason.internalCall'),
            getMessage('customer.callWidget.form.reason.tripEnquiry'),
            getMessage('customer.callWidget.form.reason.survey'),
            getMessage('customer.callWidget.form.reason.retention'),
            getMessage('customer.callWidget.form.reason.other')
          ]}
          {...this.generateStateMappers({
            stateKeys: ['reason'],
            validationType: VALIDATION_TYPES.ONSUBMIT,
            loseEmphasisOnFill: true
          })}
          validationStrings={{
            valueMissing: getMessage('input.requiredMessage')
          }}
        />
        {this.state.values.reason === 'Other' ? (
          <Textarea
            label={getMessage('customer.callWidget.form.otherReason.heading')}
            placeholder={getMessage('customer.callWidget.form.otherReason.placeholder')}
            name='otherReason'
            {...this.generateStateMappers({
              stateKeys: ['otherReason'],
              validationType: VALIDATION_TYPES.ONSUBMIT,
              loseEmphasisOnFill: true
            })}
            validationStrings={{
              valueMissing: getMessage('input.requiredMessage')
            }}
          />
        ) : null}
        <SubmitButton>{getMessage('customer.callWidget.form.submitText')}</SubmitButton>
      </Form>
    )
  }
}

class Call extends Component {
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
    params.number = this.props.phones && !!this.props.phones.length && this.props.phones[this.state.selected] && this.props.phones[this.state.selected].phone
    params.transactional = false
    params.type = 'no-template'
    if ((params.reason === 'Other') && (form.otherReason)) {
      params.reason = form.otherReason
    } else {
      params.reason = form.reason
    }
    let api = new API({ url: '/communication-service/call' })
    return api.post(params)
      .then(
        response => {
          this.dialogMessage = getMessage('customer.details.call.call')
          this.setState({ showForm: false, showDialog: true })
        }
      ).catch((error) => {
        this.setState({formError: error.message.split(':')[1]})
        if (Number(error.code) === 401) {
          throw error
        }
      })
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

  render () {
    let { selected } = this.state
    let { phones } = this.props
    let phone = phones && phones.length && phones[selected] && phones[selected].phone && Object.keys(parse(phones[selected].phone)).length > 0 ? format(parse(phones[selected].phone), 'International') : phones[selected].phone
    let message = getMessage('customer.callWidget.form.title')
    return (
      <div className='CustomerCallWidget'>
        <Popup show={this.state.showForm}
          heading={`${message}  ${phone || ''}`}
          close={this.closePopup}
        >
          <CallForm onSubmit={this.handleSubmit} formError={this.state.formError} />
        </Popup>
        {this.props.showOptions !== false ? (
          <ButtonWithOptions
            options={this.props.phones.map(({ phone }) => {
              return phone ? Object.keys(parse(phone)).length > 0 ? format(parse(phone), 'International') : phone : null
            }).filter((phone) => phone !== null)}
            selectedOption={this.state.selected}
            onChange={selected => { this.setState({ selected }) }}
            onClick={this.showPopup}
          >
            <img src={icon} alt='Call' />
          </ButtonWithOptions>
        ) : (
          <button
            className='call-icon'
            alt='Call'
            onClick={this.showPopup}
          />
        )}
        <Dialog 
        className='success' 
        show={this.state.showDialog} 
        close={this.closeDialog} 
        message={this.dialogMessage}
        closeText='OK' />
      </div>
    )
  }
}

Call.defaultProps = {
  phones: []
}

export default Call
