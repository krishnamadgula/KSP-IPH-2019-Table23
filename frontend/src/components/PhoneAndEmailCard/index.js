import React from 'react'
import Image from '../Image'
import phoneIcon from './cx-phone-icon.svg'
import emailIcon from './cx-email-icon.svg'
import verifiedIcon from './verified.svg'
import './style.css'
import { getMessage } from '../../lib/translator'
import { DropDown, DropDownItem } from '../DropDown'

import icon from './actions.png'

function customerContactActions (action, actions, props) {
  if (action === actions.setAsDefault) {
    props.setDefaultPhoneOrEmail && props.setDefaultPhoneOrEmail(props.type, props.id)
  } else if (action === actions.delete) {
    props.showDeleteOption && props.onDelete(props.id)
  }
}

export default function PhoneAndEmailDisplay (props) {
  let actions = {setAsDefault: getMessage('customer.contact.details.set.default'),
    delete: getMessage('customer.contact.details.delete')}
  const isDefault = props.defaultId === props.id
  return (
    <div className='cx-phone-email-container'>
      <div className={`cx-phone-email-card cx-${props.type}-card`}>
        <span className={`${props.type}-icon`}><img src={(props.type === 'phone') ? phoneIcon : emailIcon} alt='icon' /></span>
        <div className={`customer-${props.type}`}>{props.value}</div>
        {props.status === 'VERIFIED' && <Image src={verifiedIcon} alt='verified' />}
      </div>
      <div className='cx-phone-email-actions'>
        {isDefault && <span className='default'>{getMessage('customer.contact.details.default')}</span>}
        {!isDefault ? <DropDown icon={<img src={icon} alt='drop-down-icon' />}>
          {Object.keys(actions).map((action, index) => (
            <DropDownItem
              key={action}
              onClick={() => customerContactActions(actions[action], actions, props)}
            >
              {actions[action]}
            </DropDownItem>
          ))}
        </DropDown> : <img className='default-disabled' src={icon} alt='drop-down-icon' />}
      </div>
    </div >
  )
}
