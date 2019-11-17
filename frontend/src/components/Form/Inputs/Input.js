import React from 'react'

function getValidationObj (DomNode) {
  let validationObj = DomNode.validity
  let errors = {}
  for (let key in validationObj) {
    errors[key] = validationObj[key]
  }
  return errors
}

class Input extends React.Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.runValidation = this.runValidation.bind(this)
  }
  runValidation (DomNode) {
    let transform = this.props.transformValidationHook || function (_, validationObj) { return validationObj }
    this.props.onValidation && this.props.onValidation(transform(DomNode, getValidationObj(DomNode)))
  }
  handleChange (e) {
    e.preventDefault()
    let value = this.props.type === 'number' && e.target.value ? Number(e.target.value) : e.target.value
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
    if (prevProps.value !== this.props.value) {
      this.runValidation(this.inputRef)
    }
    if (prevProps.required !== this.props.required) {
      this.runValidation(this.inputRef)
    }
    if (prevProps.pattern !== this.props.pattern) {
      this.runValidation(this.inputRef)
    }
  }
  render () {
    let { props } = this
    const icon = (props.icon) ? ' icon icon-' + props.icon : ''
    let value = props.value
    if (value !== 0 && !value) {
      value = ''
    }
    return (
      <span className='input'>
        {props.prefix && <span className={'input-addon' + icon}>{props.prefix}</span>}
        {props.siblings && props.siblings.before ? props.siblings.before : null}
        <input
          type={props.type || 'text'}
          id={props.name}
          name={props.name}
          value={value}
          step={props.step}
          min={props.min}
          max={props.max}
          maxLength={props.maxLength}
          pattern={props.pattern || null}
          placeholder={props.placeholder}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onFocus={props.onFocus || null}
          onMouseUp={props.onMouseUp || null}
          onKeyPress={props.onKeyPress || null}
          required={props.required}
          readOnly={props.readOnly}
          ref={node => { this.inputRef = node }}
          className={props.readOnly ? 'focus-none' : ''}
        />
        {props.siblings && props.siblings.after ? props.siblings.after : null}
        {props.suffix && <span className='input-addon'>{props.suffix}</span>}
      </span>
    )
  }
}

export default Input
