import React, { Component } from 'react'
import { DropDown, DropDownItem } from '../DropDown'

import './style.css'
import icon from './icon.svg'

class ButtonWithOptions extends Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }
  selectOption (selected) {
    if (this.props.onChange && this.props.options[selected]) {
      this.props.onChange(selected)
    }
  }
  handleClick () {
    this.props.onClick && this.props.onClick()
  }
  render () {
    return (
      <div className='ButtonWithOptions'>
        <button className='action-button' onClick={this.handleClick}>
          {this.props.children}
        </button>
        <DropDown icon={<img src={icon} alt='v' />}>
          {this.props.options.map((item, index) => (
            <DropDownItem
              className={this.props.selectedOption === index ? 'selected' : ''}
              key={item}
              onClick={() => { this.selectOption(index) }}
            >
              {item}
            </DropDownItem>
          ))}
        </DropDown>
      </div>
    )
  }
}

export default ButtonWithOptions
