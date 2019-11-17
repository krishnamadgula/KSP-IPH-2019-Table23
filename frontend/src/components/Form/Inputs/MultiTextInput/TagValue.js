import React, { Component } from 'react'
import crossIcon from '../../cross_gray.svg'

export default class TagValue extends Component {
  constructor (props) {
    super(props)
    this.remove = this.remove.bind(this)
  }

  remove () {
    this.props.onRemove(this.props.value)
  }

  render () {
    const { value, readOnly } = this.props
    return (
      <div className='tag-value'>
        <span className='tag-value-label'><small>{value}</small></span>
        <button type='button' className='tag-value-icon' onClick={this.remove} disabled={readOnly} ><img src={crossIcon} alt='' /></button>
      </div>
    )
  }
}
