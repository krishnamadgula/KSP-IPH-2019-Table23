import React from 'react'
import Header from './Header'
import Row from './Row'
import Cell from './Cell'

import './style.css'

export default function Table (props) {
  return (
    <div className={props.tableDynamic ? 'table table-dynamic' : 'table'} ref={props.tableRef} >
      {props.children}
    </div>
  )
}

export {Header, Row, Cell}
