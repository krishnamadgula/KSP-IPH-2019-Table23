import React, { Component } from 'react'
import { hasPermissions } from '../../lib/auth'
import Image from '../Image'
import { Email as CustomerEmailWidget, Call as CustomerCallWidget, Sms as CustomerSmsWidget } from '../../containers/CustomerWidgets'
import {format, parse} from 'libphonenumber-js'
import './style.css'

export default class CustomerDetailsCard extends Component {
  render () {
    const {phones, emails, image, communicationConfig, defaultPhone, defaultEmail, defaultEmailId, defaultPhoneId} = this.props
    let allowCall = communicationConfig && communicationConfig.communication && (communicationConfig.communication.allowCall !== false)
    let allowSms = communicationConfig && communicationConfig.communication && (communicationConfig.communication.allowSms !== false)
    let allowEmail = communicationConfig && communicationConfig.communication && (communicationConfig.communication.allowEmail !== false)

    let number = phones && phones.filter((number) => number.id === defaultPhoneId)
    number = number && number.length > 0 && number[0] && number[0].phone
    let email = emails && emails.filter((email) => email.id === defaultEmailId)
    email = email && email.length > 0 && email[0] && email[0].email
    return (
      <div className='CustomerDetailsCard' >
        <div className='customer-details' >
          <Image src={image} />
          <div className='detail'>
            <div >{(defaultEmail && defaultEmail.email) || email}</div>
            <div >{(defaultPhone && defaultPhone.phone ? Object.keys(parse(defaultPhone.phone)).length > 0 ? format(parse(defaultPhone.phone), 'International') : defaultPhone.phone : null) || (number && Object.keys(parse(number)).length > 0 ? format(parse(number), 'International') : number)}</div>
          </div>
        </div>
        <div className='customer-actions' >
          {allowCall && hasPermissions('communication', 'call', 'post') && phones && !!phones.length && <CustomerCallWidget phones={phones} defaultPhoneId={defaultPhoneId} />}
          {allowEmail && hasPermissions('communication', 'email', 'post') && emails && !!emails.length && <CustomerEmailWidget emails={emails}
            defaultEmailId={defaultEmailId} /> }
          {allowSms && hasPermissions('communication', 'sms', 'post') && phones && !!phones.length && <CustomerSmsWidget phones={phones} defaultPhoneId={defaultPhoneId} />}
        </div>
      </div>
    )
  }
}
