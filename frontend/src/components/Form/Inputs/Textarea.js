import React, { Component } from 'react'

function getValidationObj (DomNode) {
  let validationObj = DomNode.validity
  let errors = {}
  for (let key in validationObj) {
    errors[key] = validationObj[key]
  }
  return errors
}

class Textarea extends Component {
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
    this.props.onChange && this.props.onChange(e.target.value)
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
    if (prevProps.value !== this.props.value) {
      this.runValidation(this.inputRef)
    }
  }
  render () {
    let { props } = this
    return (
      <span className='input'>
        <textarea
          id={props.name}
          name={props.name}
          value={props.value || ''}
          placeholder={props.placeholder}
          readOnly={props.readOnly}
          onChange={this.handleChange}
          maxLength={props.maxLength}
          required={props.required}
          onFocus={props.onFocus || null}
          onMouseUp={props.onMouseUp || null}
          onKeyPress={props.onKeyPress || null}
          ref={node => { this.inputRef = node }}
        />
      </span>
    )
  }
}

export default Textarea
