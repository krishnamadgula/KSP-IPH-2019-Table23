import React, { Component } from 'react'
import crossIcon from '../../cross_gray.svg'

export default class SelectValue extends Component {
  constructor (props) {
    super(props)
    this.remove = this.remove.bind(this)
  }

  remove () {
    this.props.onRemove(this.props.option)
  }

  render () {
    const { option, readOnly } = this.props
    return (
      <div className={`select-value ${readOnly ? 'readOnly' : ''}`.trim()}>
        <span className='select-value-label'><small>{option.text}</small></span>
        <button type='button' className='select-value-icon' onClick={this.remove} ><img src={crossIcon} alt='' /></button>
      </div>
    )
  }
}
