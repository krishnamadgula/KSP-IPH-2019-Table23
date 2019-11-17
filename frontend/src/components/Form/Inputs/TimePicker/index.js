import React, { Component } from 'react'
import TimePickerWrapper from '../../../TimePickerWrapper'

function getValidationObj (props, time) {
  let valueMissing = props.required && !time
  let result = {
    valueMissing,
    valid: !valueMissing
  }
  return result
}

export default class TimePicker extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.runValidation = this.runValidation.bind(this)
  }

  runValidation (time) {
    this.props.onValidation && this.props.onValidation(getValidationObj(this.props, time))
  }

  handleChange (time) {
    this.props.onChange(time)
    this.runValidation(time)
  }

  componentDidMount () {
    this.runValidation(this.props.value)
  }

  render () {
    const { label, required, placeholder, disabled } = this.props
    return (
      <TimePickerWrapper label={label} onChange={this.handleChange} required={required} placeholder={placeholder} defaultValue={this.props.value} disabled={disabled} showSecond={this.props.showSecond} minuteStep={this.props.minuteStep}/>
    )
  }
}
