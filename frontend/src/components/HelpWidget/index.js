import React from 'react'
import './style.css'

export default function HelpWidget (props) {
  return (
    <div className='helpWidget'>
      <h2>{props.title}</h2>
      <div className='scrollItems'>
        {props.children}
      </div>
    </div>
  )
}
