import React from 'react'
import './style.css'
export default function NameValueCard (props) {
  const color = props.color || 'gray'
  return (
    <div className='nameValueCard'>
      <div className={`light${color} value`}>
        {props.value}
      </div>
      <div className={`${color} name`}>
        {props.name}
      </div>
    </div>
  )
}
