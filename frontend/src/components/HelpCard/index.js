import React from 'react'
import './style.css'

export default function HelpCard (props) {
  let onAction = props.onAction
  return (
    <div className={`helpCard ${onAction ? 'actions' : ''} `} onClick={onAction}>
      <div className='image-with-title'>
        <img src={props.icon} alt='' />
        {onAction ? <div className='title action'>{props.title}</div> : <div className='title'>{props.title}</div> }
      </div>
      <p className='card-text'>{props.children}</p>
    </div>
  )
}
