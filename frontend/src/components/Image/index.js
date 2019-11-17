import React from 'react'
import placeholder from './image-placeholder.svg'

import './style.css'

export default function Image (props) {
  return (
    <div className={
      'image ' +
      (props.size ? ' image-' + props.size : '') +
      (props.bordered ? ' bordered' : '') +
      (props.className ? ' ' + props.className : '')
    }>
      <img
        src={props.src || placeholder}
        alt={props.alt}
      />
    </div>
  )
}
