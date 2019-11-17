import React, { Component } from 'react'
import './style.css'
import TagValue from './TagValue'

function getValidationObj (props, values) {
  let valueMissing = props.required && (!values || values.length === 0)
  let result = {
    valueMissing,
    valid: !valueMissing
  }
  return result
}

export default class MultiTextInput extends Component {
  constructor (props) {
    super(props);
    [
      'onKeyDown',
      'runValidation',
      'onRemove',
      'addValue',
      'handleChange'
    ].forEach((fn) => { this[fn] = this[fn].bind(this) })
  }

  runValidation (values) {
    this.props.onValidation && this.props.onValidation(getValidationObj(this.props, values))
  }

  componentDidMount () {
    this.runValidation(this.props.value)
  }

  onRemove (value) {
    const { value: values } = this.props
    let selectedValues = values
    if (Array.isArray(values) && values.some((val) => val === value)) {
      selectedValues = selectedValues.filter(e => e !== value)
      this.props.onChange && this.props.onChange(selectedValues)
      this.runValidation(selectedValues)
    }
  }

  addValue (value) {
    const { value: values } = this.props
    let selectedValues = (Array.isArray(values) && values) || []
    if (value && !selectedValues.some((val) => val === value)) {
      selectedValues.push(value)
      this.props.onChange && this.props.onChange(selectedValues)
      this.runValidation(selectedValues)
    }
  }
  handleChange (e) {
    e.preventDefault()
    this.addValue(e.target.value)
    e.target.value = ''
  }
  onKeyDown (e) {
    if (e.keyCode === 13) { // whenever enter is pressed then create a tag with text input
      e.preventDefault() // prevent submission of form on Enter
      this.addValue(e.target.value)
      e.target.value = ''
    }
  }

  render () {
    const { name, required, value: values, placeholder, readOnly } = this.props
    const tags = values && values.length > 0
      ? values.map((value, index) => (
        <TagValue key={value} value={value} onRemove={this.onRemove} readOnly={readOnly} />
      )) : null
    return (
      <div>
        <div className='input'>
          <input
            id={name}
            name={name}
            placeholder={placeholder}
            type='text'
            required={required}
            onKeyDown={this.onKeyDown}
            autoComplete='off'
            onBlur={this.handleChange}
            readOnly={readOnly}
          />
        </div>
        <div className='multitext-tags' >
          {tags}
        </div>
      </div>
    )
  }
}
