import React, { Component } from 'react'
import _Toggle from 'react-toggle'
import './style.css'

function getValidationObj (props, value) {
  let valueMissing = props.required ? !value : false
  return {
    valueMissing,
    valid: !valueMissing
  }
}

class Toggle extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (e) {
    this.props.onChange && this.props.onChange(e.target.checked)
  }

  runValidation () {
    this.props.onValidation && this.props.onValidation(getValidationObj(this.props, this.props.value))
  }

  componentDidMount () {
    this.runValidation()
  }

  render () {
    let { emphasize, onValidation, className, showErrors, onChange, label, ...props } = this.props
    let ToggleInput = _Toggle
    let defaultChecked = false
    let checked = props.value || defaultChecked
    return (
      <div className={`Toggle ${className}`} title={props.title || null}>
        <label htmlFor={props.name}>{props.togglelabel}</label>
        <ToggleInput
          id={props.name}
          checked={checked}
          value={props.name}
          icons={props.icons}
          onChange={this.handleChange} />
      </div>
    )
  }
}
export default Toggle
