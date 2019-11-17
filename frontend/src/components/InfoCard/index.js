import React from 'react'
import Image from '../Image'
import './style.css'

export default function InfoCard (props) {
  return (
    <div className={`InfoCard ${props.className}`}>
      <Image src={props.src} />
      <div className='infocard-details'>
        <div className='title' >{props.title}</div>
        <div className='description' >{props.description}</div>
      </div>
    </div>
  )
}
