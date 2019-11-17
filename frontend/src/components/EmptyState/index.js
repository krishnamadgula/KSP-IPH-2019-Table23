import React from 'react'

import './style.css'

export default function EmptyState (props) {
  let views = props.additionalViews || []
  return (
    <div className='emptyState'>
      <img src={props.icon} alt='No Data' />
      <p className='message'>{props.message}</p>
      <div className='submessage'>{props.submessage}</div>
      {views.map((View, index) => <View key={index} />)}
    </div>
  )
}
