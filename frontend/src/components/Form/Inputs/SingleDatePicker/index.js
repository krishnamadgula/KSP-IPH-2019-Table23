import React, { Component } from 'react'
import SingleDatePickerWrapper from '../../../SingleDatePickerWrapper'

import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import './override.css'

function getValidationObj (props, date) {
  let valueMissing = props.required && !date
  let result = {
    valueMissing,
    valid: !valueMissing
  }
  return result
}

export default class SingleDatePicker extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.runValidation = this.runValidation.bind(this)
  }

  runValidation (date) {
    this.props.onValidation && this.props.onValidation(getValidationObj(this.props, date))
  }

  handleChange (date) {
    this.props.onChange(date)
    this.runValidation(date)
  }

  componentDidMount () {
    this.runValidation(this.props.value)
  }

  render () {
    let { value, displayFormat, required, placeholder, numberOfMonths, isOutsideRange, enableToday, allowAllDates, openDirection, readOnly, disabled, name, key, showError } = this.props
    return (
      <SingleDatePickerWrapper
        numberOfMonths={numberOfMonths}
        date={value}
        displayFormat={displayFormat}
        required={required}
        placeholder={placeholder}
        onDateChange={this.handleChange}
        isOutsideRange={isOutsideRange}
        allowAllDates={allowAllDates}
        enableToday={enableToday}
        openDirection={openDirection}
        readOnly={readOnly}
        disabled={disabled}
        name={name}
        key={key}
        showError={showError}
      />
    )
  }
}
