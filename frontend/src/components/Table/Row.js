import React from 'react'

export default function Row (props) {
  return (
    <div className={'table-row ' + (props.className || '')}>
      {props.children}
    </div>
  )
}
