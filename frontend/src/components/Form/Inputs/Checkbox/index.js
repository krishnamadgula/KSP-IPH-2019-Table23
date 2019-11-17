import React, { Component } from 'react'

import './style.css'

class Checkbox extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (e) {
    this.props.onChange && this.props.onChange(e.target.checked)
  }

  render () {
    const { name, value, inlineLabel, className = '', controlled = false, disabled } = this.props
    return (
      <span className={`Checkbox ${className}`}>
        <input
          type='checkbox'
          id={name}
          name={name}
          value={name}
          disabled={disabled}
          onChange={this.handleChange}
          {...{
            [controlled ? 'checked' : 'defaultChecked']: value
          }}
        />
        <label className='inline-label' htmlFor={name}>
          {inlineLabel}
        </label>
      </span>
    )
  }
}

export default Checkbox
