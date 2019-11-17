import React, { Component } from 'react'

import './style.css'

function getValidationObj (props, checkedValues) {
  let valueMissing = props.required && (!checkedValues || checkedValues.length === 0)
  let result = {
    valueMissing,
    valid: !valueMissing
  }
  return result
}

class CheckboxGroup extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.runValidation = this.runValidation.bind(this)
  }

  runValidation (values) {
    this.props.onValidation && this.props.onValidation(getValidationObj(this.props, values))
  }

  handleChange (e) {
    const checked = e.target.checked
    let checkedValues = (Array.isArray(this.props.value) && this.props.value) || []
    if (checked && !checkedValues.includes(e.target.value)) {
      checkedValues.push(e.target.value)
    } else if (!checked) {
      checkedValues = checkedValues.filter(function (i) {
        return i !== e.target.value
      })
    }
    this.props.onChange && this.props.onChange(checkedValues)
    this.runValidation(checkedValues)
  }

  componentDidMount () {
    this.runValidation(this.props.value)
  }

  render () {
    let { value, options } = this.props
    return (
      <div className={`checkbox-group ${this.props.skin}`}>
        {(options || []).map((option, index) => (
          <label
            className={'checkbox-label' + (value && Array.isArray(value) && value.includes(option.value) ? ' selected' : '')}
            key={option.value}
          >
            {this.props.skin === SKINS.WITH_ICONS && option.icon && (
              <div className='checkbox-icon-wrapper'>
                <img src={option.icon} className='checkbox-icon' alt='' />
              </div>
            )}
            <input
              type='checkbox'
              name={option.name}
              value={option.value}
              onChange={this.handleChange}
              defaultChecked={value && Array.isArray(value) && value.includes(option.value)}
            />
            <span className='checkbox-text'>{option.text}</span>
          </label>
        ))}
      </div>
    )
  }
}

const SKINS = {
  DEFAULT: 'default-skin',
  WITH_ICONS: 'icons-skin'
}

CheckboxGroup.defaultProps = {
  value: '',
  options: [],
  skin: SKINS.DEFAULT
}

export default CheckboxGroup
export { SKINS }
