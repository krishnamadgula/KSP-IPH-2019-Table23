import React from 'react'
import Imag from '../../Image'
import img from '../ImageWithText/image.png'

export default function Image (props) {
  let className = 'Image'
  if (!props.data) {
    return (
      <div>
        <img src={img} alt='uploaded' />
      </div>
    )
  }
  return (
    <div className={className}>
      <figure>
        <Imag src={props.data.imageUrl} alt='uploaded image' />
      </figure>
    </div>
  )
}
