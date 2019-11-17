import React from 'react'
import './style.css'
import img from './image.png'

export default function ProductCollection (props) {
  if (!props.data) {
    return (
      <div>
        <img src={img} alt='' />
      </div>
    )
  }
  return (
    <div>
      {props.data.title && <h2>{props.data.title}</h2>}
      {props.data.subtitle && <h3>{props.data.subtitle}</h3>}
      <img src={img} alt='' />
    </div>
  )
}
