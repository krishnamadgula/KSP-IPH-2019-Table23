import React, { Component } from 'react'

export default class WithoutMenuPage extends Component {
  render () {
    const { props } = this
    return (
      <div className={props.className}>
        {props.children}
      </div>
    )
  }
}
