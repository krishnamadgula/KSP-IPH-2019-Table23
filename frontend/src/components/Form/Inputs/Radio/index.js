import React, { Component } from 'react'

import './style.css'

function getValidationObj (DomNode) {
  if (!DomNode) {
    return {}
  }
  let validationObj = DomNode.validity
  let errors = {}
  for (let key in validationObj) {
    errors[key] = validationObj[key]
  }
  return errors
}

class Radio extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    // this.handleBlur = this.handleBlur.bind(this)
    // this.runValidation = this.runValidation.bind(this)
  }
  runValidation (DomNode) {
    this.props.onValidation && this.props.onValidation(getValidationObj(DomNode))
  }
  handleChange (e) {
    e.preventDefault()
    this.props.onChange && this.props.onChange(e.target.value)
    this.runValidation(e.target)
  }
  componentDidMount () {
    this.runValidation(this.inputRef)
  }
  render () {
    let { props } = this
    return (
      <div className={`Radio ${props.skin}`}>
        {(props.options || []).map((option, index) => (
          <label
            className={'radio-label' + (String(props.value) === String(option.value) ? ' selected' : '')}
            key={option.value}
          >
            <input
              type='radio'
              name={props.name}
              value={option.value}
              required={props.required}
              onClick={this.handleChange}
              ref={node => {
                if (index === 0) {
                  this.inputRef = node
                }
              }}
              disabled={props.readOnly || option.disabled}
            />
            <span className='radio-label-text' title={option.titleText}>{option.text}</span>
          </label>
        ))}
      </div>
    )
  }
}

const SKINS = {
  DEFAULT: '',
  BORDERLESS: 'borderless-skin',
  ONE_PER_LINE: 'block-skin'
}

Radio.defaultProps = {
  value: '',
  options: [],
  skin: SKINS.DEFAULT
}

export default Radio
export { SKINS }
