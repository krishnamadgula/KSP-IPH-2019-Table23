import React, { Component } from 'react'
import './style.css'

class Send extends Component {
  render () {
    const { props } = this
    return (
      <div className='Send'>
        <div className='name-part'>
          <div className='icon'><img src={props.icon} alt='' /></div>
          <div className='name'>{props.name}</div>
        </div>
        <div className='to'>{props.midText}</div>
        <div className='value-part'>
          <div className='value'>{props.value}</div>
          <div className='delete' onClick={props.onDelete} />
        </div>
      </div>
    )
  }
}
export default Send
