import React from 'react'
import Image from '../../Image'
import './style.css'
import img from './image.png'

export default function ImageWithText (props) {
  var textPosition = props.textPosition || 'bottom'
  var className = `${textPosition} ImageWithText`
  if (!props.data) {
    return (
      <div>
        <img src={img} alt='' />
      </div>
    )
  }
  return (
    <div className={className} >
      <figure>
        <Image src={props.data.imageUrl} alt='uploaded image' />
        <figcaption>
          <h2 className='title'>{props.data.title}</h2>
          <h3>{props.data.subtitle}</h3>
          <p className='description'>{props.data.description}</p>
        </figcaption>
      </figure>
    </div>
  )
}
