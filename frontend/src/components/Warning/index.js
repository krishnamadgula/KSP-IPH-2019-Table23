import React from 'react'
import './style.css'
import { Link } from 'react-router-dom'

export default function Warning (props) {
  const { textToBold, sentence, helpLink, tooltipText } = props
  return (
    <div className='Warning'>
      <div className='title' ><span>{textToBold}</span> {sentence}</div>
      {helpLink ? <Link to={helpLink}><div className='tooltip' /></Link>
        : <div className='tooltip' >{tooltipText && <div className='tooltiptext'>{tooltipText}</div>}</div>}
    </div>
  )
}
