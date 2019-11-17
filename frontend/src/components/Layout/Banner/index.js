import React from 'react'
import img from './banner.svg'

export default function Banner (props) {
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
      <img src={img} alt='' />
    </div>
  )
}
