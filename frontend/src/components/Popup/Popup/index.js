import React from 'react'
import Modal from '../Modal/index'
import './style.css'

export default function Popup (props) {
  return (
    <Modal show={props.show} close={props.close}>
      <div className={`editPopup ${props.className}`} onClick={props.onClick}>
        <div className='header'>
          <h1>{props.heading}</h1>
          <button className='close' onClick={props.close} />
        </div>
        <div className='details'>
          {props.children}
        </div>
      </div>
    </Modal>
  )
}
