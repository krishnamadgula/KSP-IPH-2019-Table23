import React, { Component } from 'react'

import './style.css'
class MultiLevelCheckbox extends Component {
  render () {
    let options = this.props.options || []
    return (
      <div className='MultiLevelCheckbox'>
        {renderCheckboxes(options, this.props.value, this.props.onChange)}
      </div>
    )
  }
}

function Checkbox (props) {
  return (
    <div className='Checkbox'>
      <input type='checkbox' id={props.name} checked={props.value} value={props.value} onChange={props.onChange.bind(null, props.name)} />
      <label className='inline-label' htmlFor={props.name}>
        {props.label}
      </label>
    </div>
  )
}

function renderCheckboxes (options, value, onChange, depth = 1) {
  options = options || []
  if (value === undefined || value === null) {
    value = getInitialState(options)
  }
  return (
    <div className='multi-checkbox-group' data-depth={depth}>
      {options.map(({ name, label, children }) => {
        let thisValue = computeChecked(value[name])
        return (
          <div key={name}>
            <Checkbox
              {...{ name, label }}
              onChange={() => {
                let changedValue = Object.assign({}, value)
                changedValue[name] = toggleAll(value[name], !thisValue)
                onChange(changedValue)
              }}
              value={thisValue}
            />
            <div className='checkbox-level'>
              {children ? renderCheckboxes(children, value[name], (changedValue) => {
                onChange(Object.assign({}, value, {
                  [name]: changedValue
                }))
              }, depth + 1) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function computeChecked (value) {
  if (value instanceof Object) {
    return Object.values(value).reduce((acc, value) => (acc && computeChecked(value)), true)
  }
  return value
}

function toggleAll (obj, value) {
  if (!(value instanceof Object || typeof value === 'boolean')) {
    return obj
  }
  if (obj instanceof Object) {
    let updatedObj = Object.assign({}, obj)
    for (let key in updatedObj) {
      updatedObj[key] = toggleAll(obj[key], value)
    }
    return updatedObj
  }
  return value
}

function getInitialState (options) {
  return Object.assign({}, ...options.map(obj => {
    return {
      [obj.name]: obj.children ? getInitialState(obj.children) : false
    }
  }))
}

export default MultiLevelCheckbox
export { getInitialState, computeChecked, toggleAll }
