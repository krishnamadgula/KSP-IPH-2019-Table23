import React from 'react'
import _Input from './Input'
import _Select from './Select'
import _Upload from './Upload/'
import _Textarea from './Textarea'
import _Phone from './Phone/'
import _Checkbox from './Checkbox/'
import _Radio from './Radio'
import _Searchable from './Searchable/'
import _CheckboxGroup from './CheckboxGroup/'
import _MultiLevelCheckbox from './MultiLevelCheckbox/'
import _MultiSelect from './MultiSelect/'
import _MultiTextInput from './MultiTextInput/'
import _Toggle from './Toggle'
import _SelectSearch from './SelectSearch'
import _BrandSearch from './BrandSearch'
import _CustomerTagSearch from './CustomerTagSearch'
import _CategorySearch from './CategorySearch'
import _TimePicker from './TimePicker'

import './style.css'

const getValidationString = function (validationObj, stringsObj) {
  stringsObj = stringsObj || {}
  if (validationObj && !validationObj.valid) {
    if (validationObj.valueMissing) {
      return (stringsObj.valueMissing || 'This field is required')
    }
    if (validationObj.typeMismatch) {
      return (stringsObj.typeMismatch || 'Incorrect data format')
    }
    if (validationObj.tooShort) {
      return (stringsObj.tooShort || 'Too short')
    }
    if (validationObj.tooLong) {
      return (stringsObj.tooLong || 'Too long')
    }
    if (validationObj.rangeOverflow) {
      return (stringsObj.rangeOverflow || 'Number exceeds range')
    }
    if (validationObj.rangeUnderflow) {
      return (stringsObj.rangeUnderflow || 'Number is below the range')
    }
    if (validationObj.patternMismatch) {
      return (stringsObj.patternMismatch || 'Incorrect Value')
    }
    if (validationObj.stepMismatch) {
      return (stringsObj.stepMismatch || 'Step mismatch')
    }
    if (validationObj.isUploading) {
      return (stringsObj.isUploading || 'File upload in process')
    }
  }
}

// HoC to wrap Inputs with validation methods
const addValidations = (Component) => {
  class InputValidator extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        validations: {}
      }
    }
    render () {
      let error = this.props.error || getValidationString(this.state.validations, this.props.validationStrings)
      let showErrors = (this.props.showErrors === true)
      let newProps = Object.assign({}, this.props)
      newProps.onValidation = (validations) => {
        this.setState({ validations })
        this.props.onValidation && this.props.onValidation(validations)
      }
      return (
        <div className={'input-wrapper' + (showErrors && error ? ' input-error' : '')}>
          <Component {...newProps} />
          {error && <div className='input-error-message'>{showErrors ? error : null}</div>}
        </div>
      )
    }
  }
  return InputValidator
}

const Input = addValidations(_Input)
const Select = addValidations(_Select)
const Upload = addValidations(_Upload)
const Textarea = addValidations(_Textarea)
const Phone = addValidations(_Phone)
const Checkbox = addValidations(_Checkbox)
const Radio = addValidations(_Radio)
const Searchable = addValidations(_Searchable)
const CheckboxGroup = addValidations(_CheckboxGroup)
const MultiLevelCheckbox = addValidations(_MultiLevelCheckbox)
const MultiSelect = addValidations(_MultiSelect)
const MultiTextInput = addValidations(_MultiTextInput)
const Toggle = addValidations(_Toggle)
const SelectSearch = addValidations(_SelectSearch)
const BrandSearch = addValidations(_BrandSearch)
const CustomerTagSearch = addValidations(_CustomerTagSearch)
const CategorySearch = addValidations(_CategorySearch)
const TimePicker = addValidations(_TimePicker)

export {
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
