import React from 'react'
import { cloneMutables, getNestedState, updateStateRecursively } from '../../lib/stateManagement/'

import {
  Input as _Input,
  Select as _Select,
  Upload as _Upload,
  Textarea as _Textarea,
  Phone as _Phone,
  Checkbox as _Checkbox,
  Radio as _Radio,
  Searchable as _Searchable,
  CheckboxGroup as _CheckboxGroup,
  MultiLevelCheckbox as _MultiLevelCheckbox,
  MultiSelect as _MultiSelect,
  MultiTextInput as _MultiTextInput,
  Toggle as _Toggle,
  SelectSearch as _SelectSearch,
  BrandSearch as _BrandSearch,
  CategorySearch as _CategorySearch,
  CustomerTagSearch as _CustomerTagSearch,
  TimePicker as _TimePicker
} from './Inputs'

import './form.css'

const VALIDATION_TYPES = {
  ALWAYS: 'ALWAYS',
  ONCHANGE: 'ONCHANGE',
  ONBLUR: 'ONBLUR',
  ONSUBMIT: 'ONSUBMIT'
}

// A helper method to easily register input events like change, blur, etc.
// NOTE: Context of this method should be bound to the respective form
function generateStateMappers ({
  formatValue = value => value,
  formatChange = value => value,
  defaultValue,
  validationType = VALIDATION_TYPES.ONSUBMIT,
  stateKeys,
  loseEmphasisOnFill = false
}) {
  let showErrors = false
  if (validationType) {
    switch (validationType) {
      case VALIDATION_TYPES.ALWAYS:
        showErrors = true
        break
      case VALIDATION_TYPES.ONCHANGE:
        showErrors = this.validationScenarios.validateOnChange(stateKeys)
        break
      case VALIDATION_TYPES.ONBLUR:
        showErrors = this.validationScenarios.validateOnBlur(stateKeys)
        break
      case VALIDATION_TYPES.ONSUBMIT:
        showErrors = this.validationScenarios.validateOnSubmit()
        break
      default: break
    }
  }
  let emphasize = true
  if (loseEmphasisOnFill) {
    // emphasize = false only if value is non-empty
    let value = this.getState(stateKeys)
    if (value === undefined || value === null) {
      emphasize = true
    } else {
      let type = typeof value
      switch (type) {
        case 'boolean':
          emphasize = false
          break
        case 'object':
          if ((Array.isArray(value) && value.length) || Object.keys(value).length) {
            emphasize = false
          }
          break
        case 'number':
          if (value || value === 0) {
            emphasize = false
          }
          break
        default:
          if (value) {
            emphasize = false
          }
          break
      }
    }
  }
  let value = this.getState(stateKeys)
  if (value !== 0 && !value) {
    value = defaultValue
  }
  return {
    value: formatValue(value),
    onChange: (value, error) => {
      value = formatChange(value)
      this.updateState(stateKeys, value)
      updateStateRecursively.call(this, ['blurred', ...stateKeys], false)
    },
    onValidation: (error) => { this.registerValidation(stateKeys, error) },
    onBlur: () => { updateStateRecursively.call(this, ['blurred', ...stateKeys], true) },
    // Whether the input should be emphasized (with bold label, etc)
    emphasize,
    showErrors
  }
}

export default function Form (props) {
  return (
    <form {...props} />
  )
}

class BaseForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      values: props.value ? cloneMutables(props.value) : {}, // Use immutable objects instead
      touched: {},
      blurred: {},
      validations: {},
      submitting: props.submitting || false,
      pressedSubmitWithCurrentData: false
    }
    this._submitHandler = this._submitHandler.bind(this)
    this.generateStateMappers = generateStateMappers.bind(this)
    this.beforeSubmit = this.beforeSubmit.bind(this)
    this.buttons = {
      SubmitButton: (props) => (
        <input className='primary' type='submit' value={(this.state.submitting) ? '...' : props.children} disabled={props.disabled || this.state.submitting} />
      ),
      CancelButton: (props) => (
        <button className='button' type='button' disabled={props.disabled} onClick={this.props.onCancel}>{props.children}</button>
      ),
      ClearButton: (props) => (
        <button className='button' type='button' disabled={props.disabled} onClick={this.props.onClear}>{props.children}</button>
      )
    }
    this.components = {
      Form: (props) => (
        <form className={props.className} onSubmit={this._submitHandler} noValidate>{props.children}</form>
      )
    }

    // Some validation helpers
    this.validationScenarios = {
      validateOnChange: (stateKeys) => (getNestedState.call(this, ['touched', ...stateKeys])),
      validateOnBlur: (stateKeys) => (getNestedState.call(this, ['blurred', ...stateKeys])),
      validateOnSubmit: () => (this.state.pressedSubmitWithCurrentData)
    }
  }
  getState (keys) {
    return getNestedState.call(this, ['values', ...keys])
  }
  updateState (keys, value, registerAsUserInput = true) {
    this.setState({
      pressedSubmitWithCurrentData: false
    })
    updateStateRecursively.call(this, ['values', ...keys], value)
    if (registerAsUserInput) {
      // False value implies that this value was modified programatically, so don't modify 'touched' value
      updateStateRecursively.call(this, ['touched', ...keys], true)
    }
  }
  registerValidation (keys, error) {
    updateStateRecursively.call(this, ['validations', ...keys], error)
  }
  isFormValid (validationObj) {
    let validations = validationObj || this.state.validations
    if (!validations) {
      validations = {}
    }
    if ('valid' in validations) {
      return validations.valid
    }
    return Object.keys(validations)
      .map(name => (
        Array.isArray(validations[name])
          // If this field has more fields nested in it
          ? validations[name]
            .map(validation => this.isFormValid(validation))
            .reduce((value, acc) => (value && acc), true)
          : 'valid' in validations[name]
            ? validations[name].valid
            : (!(typeof validations[name] === 'object' && Object.keys(validations[name]).length === 0) && typeof Object.values(Object.values(validations[name])[0])[0] === 'boolean') ? this.isFormValid(validations[name]) : Object.values(validations[name]).map(validation => this.isFormValid(validation)).reduce((value, acc) => (value && acc), true)
      )
      )
      .reduce((value, acc) => (value && acc), true)
  }
  beforeSubmit () {
    // Update this method if you want to do something before submission happens
    // E.g. Navigate to an input with an error in the page
  }
  onSubmit (data) {
    // Form submission logic. This is the function that the user would define
  }
  _submitHandler (e) {
    e && e.preventDefault()
    this.beforeSubmit()
    this.setState({
      pressedSubmitWithCurrentData: true
    })
    let isValid = this.isFormValid()
    if (isValid) {
      if (this.props.onSubmit) {
        let values = cloneMutables(this.state.values) // Use immutable objects instead
        this.props.onSubmit(values)
      } else {
        this.onSubmit(this.state.values)
      }
    }
  }
  componentWillReceiveProps (newProps) {
    if (newProps.value) {
      let values = cloneMutables(newProps.value) // Use immutable objects instead
      this.setState({
        values: values,
        submitting: newProps.submitting
      })
    }
  }
  render () {
    let { Form } = this.components
    return (
      <Form />
    )
  }
}

// HoC to wrap Inputs, providing them form-related styling and functionality
const wrapInput = (Component) => {
  const InputWrapper = ({ className, ...props }) => {
    if (!props.label) {
      return (
        <Component {...props} />
      )
    }
    return (
      <div className={'field' + (className ? ' ' + className : '')}>
        <span className='labelWrap' >
          {props.label ? (
            <label htmlFor={props.name}
              className={(props.emphasize === false || props.readOnly === true) ? 'thin' : null}
            >
              {props.label}
            </label>
          ) : null}
          {props.secondaryLabel && props.secondaryLabel()}
        </span>
        <Component {...props} />
        {props.children && <div className='description'>{props.children}</div>}
      </div>
    )
  }
  return InputWrapper
}

const Input = wrapInput(_Input)
const Upload = wrapInput(_Upload)
const Select = wrapInput(_Select)
const Textarea = wrapInput(_Textarea)
const Phone = wrapInput(_Phone)
const Checkbox = wrapInput(_Checkbox)
const Radio = wrapInput(_Radio)
const Searchable = wrapInput(_Searchable)
const CheckboxGroup = wrapInput(_CheckboxGroup)
const MultiLevelCheckbox = wrapInput(_MultiLevelCheckbox)
const MultiSelect = wrapInput(_MultiSelect)
const MultiTextInput = wrapInput(_MultiTextInput)
const Toggle = wrapInput(_Toggle)
const SelectSearch = wrapInput(_SelectSearch)
const BrandSearch = wrapInput(_BrandSearch)
const CustomerTagSearch = wrapInput(_CustomerTagSearch)
const CategorySearch = wrapInput(_CategorySearch)
const TimePicker = wrapInput(_TimePicker)

export {
  BaseForm,
  VALIDATION_TYPES,
  Input,
  Select,
  Upload,
  Textarea,
  Phone,
  Checkbox,
  Radio,
  Searchable,
  CheckboxGroup,
  MultiLevelCheckbox,
  MultiSelect,
  MultiTextInput,
  Toggle,
  SelectSearch,
  BrandSearch,
  CategorySearch,
  CustomerTagSearch,
  TimePicker
}
