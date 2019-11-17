import React from 'react'
import './style.css'

export default function DetailsCard (props) {
  return (
    <div className='DetailsCard' >
      <div className='top'>
        <div className='left' >
          <div className='title' >{props.leftTitle}</div>
          <div className='value' >{props.leftValue}</div>
        </div>
        <div className='right' >
          <div className='title' >{props.rightTitle}</div>
          <div className={`value ${props.color}`} >{props.rightValue}</div>
        </div>
      </div>
      <div className='bottom' >
        <div className='value' >{props.bottomValue}</div>
        <div>{props.children}</div>
      </div>
    </div>
  )
}
