import React, { Component } from 'react'
import { DropDown, DropDownItem, ICONS } from '../../components/DropDown'
import './style.css'

export default class ValueOptionsCard extends Component {
  render () {
    const props = this.props
    return (
      <div className='ValueOptionsCard' >
        <div className='value' >{props.value}</div>
        {props.showDeleteOption && <DropDown icon={<img src={ICONS.VELLIP} alt='⋮' />}>
          <DropDownItem onClick={() => { props.onDelete(props.id) }} id={props.id} >{props.action}</DropDownItem>
        </DropDown>}
      </div>
    )
  }
}
