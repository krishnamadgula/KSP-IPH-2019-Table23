import React, { Component } from 'react'
import _Phone from 'react-phone-number-input'

import 'react-phone-number-input/rrui.css'
import 'react-phone-number-input/style.css'
import './override.css'

function getValidationObj (props, value) {
  let valueMissing = props.required ? !value : false
  return {
    valueMissing,
    valid: !valueMissing
  }
}

class Phone extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.runValidation = this.runValidation.bind(this)
  }

  handleChange (value) {
    this.props.onChange && this.props.onChange(value)
    this.runValidation(value)
  }

  runValidation (value) {
    this.props.onValidation && this.props.onValidation(getValidationObj(this.props, value))
  }

  componentDidMount () {
    this.runValidation()
  }
  render () {
    let { emphasize, onValidation, showErrors, onChange, country, ...props } = this.props
    let PhoneInput = _Phone
    return (
      <PhoneInput {...props} onChange={this.handleChange} country={country || 'IN'} displayInitialValueAsLocalNumber />
    )
  }
}

export default Phone
