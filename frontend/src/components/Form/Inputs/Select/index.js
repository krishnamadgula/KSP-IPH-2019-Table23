import React, { Component } from 'react'
import { isEqual } from 'lodash'
import './style.css'

function getValidationObj (DomNode) {
  let validationObj = DomNode.validity
  let errors = {}
  for (let key in validationObj) {
    errors[key] = validationObj[key]
  }
  return errors
}

class Select extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.runValidation = this.runValidation.bind(this)
  }
  runValidation (DomNode) {
    this.props.onValidation && this.props.onValidation(getValidationObj(DomNode))
    this.props.validationObject && this.props.validationObject(DomNode)
  }
  handleChange (e) {
    e.preventDefault()
    let value = e.target.value
    if (this.props.type === 'number') {
      value = Number(value)
    }
    this.props.onChange && this.props.onChange(value)
    this.runValidation(e.target)
  }
  handleBlur (e) {
    e.preventDefault()
    this.props.onBlur && this.props.onBlur()
  }
  componentDidMount () {
    this.runValidation(this.inputRef)
  }

  componentDidUpdate (prevProps) {
    if (!isEqual(prevProps.value, this.props.value)) {
      this.runValidation(this.inputRef)
    }
    if (prevProps.required !== this.props.required) {
      this.runValidation(this.inputRef, 'zone')
    }
  }

  render () {
    let { props } = this
    let value = (Array.isArray(props.value) ? props.value[0] : props.value) || ''
    if (props.type === 'number' && value) {
      value = Number(value)
    }
    return (
      <span className='Select'>
        <select
          id={props.name}
          name={props.name}
          value={value}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          readOnly={props.readOnly}
          required={props.required}
          disabled={props.disabled || props.readOnly}
          ref={node => { this.inputRef = node }}
        >
          <option value='' disabled>{props.placeholder}</option>
          {props.options.map(option => {
            if (typeof option === 'object' && !option.text) {
              return null
            }
            return <option
              key={option.value ? option.value : option}
              value={option.value ? option.value : option}
            >
              {option.text ? option.text : option}
            </option>
          })}
        </select>
      </span>
    )
  }
}

Select.defaultProps = {
  options: [],
  disabled: false
}

export default Select
