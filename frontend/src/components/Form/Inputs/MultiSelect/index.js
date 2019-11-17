import React, { Component } from 'react'
import arrowIcon from './arrow.svg'
import './style.css'
import SelectValue from './SelectValue'
import { isEqual } from 'lodash'

function getValidationObj (props, selectedValues) {
  let valueMissing = props.required && (!selectedValues || selectedValues.length === 0)
  let result = {
    valueMissing,
    valid: !valueMissing
  }
  return result
}

export default class MultiSelect extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    };
    [
      'onSelect',
      'onRemove',
      'expand',
      'setWrapperRef',
      'handleClickOutside',
      'runValidation'
    ].forEach((fn) => { this[fn] = this[fn].bind(this) })
  }

  runValidation (values) {
    this.props.onValidation && this.props.onValidation(getValidationObj(this.props, values))
  }

  expand () {
    this.setState({ expanded: true })
  }

  componentDidMount () {
    window.addEventListener('mousedown', this.handleClickOutside)
    this.runValidation(this.props.value)
  }

  componentWillUnmount () {
    window.removeEventListener('mousedown', this.handleClickOutside)
  }

  componentDidUpdate (prevProps) {
    if (!isEqual(prevProps.value, this.props.value)) {
      this.runValidation(this.props.value)
    }
  }

  // set wrapper ref
  setWrapperRef (node) {
    this.wrapperRef = node
  }
  // close dropdown if clicked outside the wrapper
  handleClickOutside (event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ expanded: false })
    }
  }
  // on select of an option , add it to array of selected values
  onSelect (option) {
    if (this.props.readOnly) {
      return
    }
    const valueKey = this.props.valueKey
    const value = option && option[valueKey]
    let selectedValues = (Array.isArray(this.props.value) && this.props.value) || []
    if (option && !selectedValues.some((val) => val === value)) {
      selectedValues.push(value)
    }
    this.props.onChange && this.props.onChange(selectedValues)
    this.runValidation(selectedValues)
  }
  // on remove of an option, remove it from array of selected values
  onRemove (option) {
    if (this.props.readOnly) {
      return
    }
    const { valueKey, value: values } = this.props
    const selectedValue = option && option[valueKey]
    let selectedValues = values
    if (Array.isArray(values) && values.some((val) => val === selectedValue)) {
      selectedValues = selectedValues.filter(e => e !== selectedValue)
      this.props.onChange && this.props.onChange(selectedValues)
    }
  }

  render () {
    const { type, name, placeholder, required, options, value, valueKey, nameKey, readOnly, dontDisplaySelected } = this.props
    const { expanded } = this.state

    let selectableValues = []
    let selectedValues = []
    if (options.length) {
      options.forEach((option, index) => {
        let suggestionAllowed = !(value && Array.isArray(value) && value.some((val) => val === option[valueKey]))
        if (suggestionAllowed) { // Do not show selected values in options dropdown
          selectableValues.push(
            <li className={`select-option ${this.props.readOnly ? 'readOnly' : ''}`} key={option[valueKey]} onClick={(e) => this.onSelect(option)}>
              {option[nameKey]}
            </li>
          )
        } else { // Render all the selected values as SelectValue component
          selectedValues.push(
            <SelectValue key={option[valueKey]} option={option} onRemove={this.onRemove} readOnly={readOnly} />
          )
        }
      })
    }

    return (
      <div className={`multi-select ${readOnly ? '' : 'notReadOnly'}`.trim()} ref={this.setWrapperRef}>
        <div className='select-input'>
          <div className='input'>
            <input
              id={name}
              name={name}
              type={type || 'text'}
              value={this.state.searchText}
              placeholder={placeholder}
              required={required}
              autoComplete='off'
              onFocus={this.expand}
              readOnly='readonly' // do not allow to type in multi select input field
              className={readOnly ? 'focus-none' : ''}
            />
            <img src={arrowIcon} className='select-field-icon' alt='' />
          </div>
        </div>
        {expanded && selectableValues.length > 0 && !readOnly && <div className='select-field-dropdown-container'>
          <ul className='select-field-dropdown'>
            {selectableValues}
          </ul>
        </div>}
        {!dontDisplaySelected && selectedValues}
      </div>
    )
  }
}

MultiSelect.defaultProps = {
  nameKey: 'text',
  valueKey: 'value',
  readOnly: false
}
