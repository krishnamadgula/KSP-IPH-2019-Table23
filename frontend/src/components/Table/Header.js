import React from 'react'

export default function Row (props) {
  let data = props.items || []
  return (
    <div className='table-header'>
      {data.map((header, index) => (
        <div key={index} className='table-cell'>{header}</div>
      ))}
      {props.children}
    </div>
  )
}
