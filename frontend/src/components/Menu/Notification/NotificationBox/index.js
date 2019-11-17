import React from 'react'
import closeIcon from './close-icon.svg'
import './style.css'

const NotificationBox = (props) => {
  return (
    <div className='NotificationBox'>
      <div className='heading flex-around'>
        <h2 className='title' >{props.title}</h2>
        <img src={closeIcon} alt='close icon' onClick={props.close} className='close-icon notification-close-icon' />
      </div>
      <div className='content' >
        {props.children}
      </div>
    </div>
  )
}

export default NotificationBox
