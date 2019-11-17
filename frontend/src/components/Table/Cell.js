import React from 'react'

export default function Cell (props) {
  let alignmentClass = (props.align === 'right' ? ' align-right' : '')
  return (
    <div className={'table-cell ' + (props.className || '') + alignmentClass} data-abbreviation={props.abbreviation}>
      {props.children}
    </div>
  )
}
