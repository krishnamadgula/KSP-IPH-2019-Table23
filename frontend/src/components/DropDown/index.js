import React, { Component } from 'react'
import './style.css'

import HELLIP from './horizontal-ellipsis.svg'
import VELLIP from './vertical-ellipsis.svg'

class DropDown extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    }
    this.toggle = this.toggle.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }
  toggle (e) {
    e && e.preventDefault()
    this.setState({
      expanded: !this.state.expanded
    })
  }
  hide (e) {
    e && e.preventDefault()
    this.setState({
      expanded: false
    })
  }
  handleClick (e) {
    if (this.dropdownRef.contains(e.target)) {
      if (this.toggleRef.contains(e.target)) {
        // The toggle handle was clicked
        this.toggle()
      } else if (e.target.classList.contains('dropdown-item')) {
        // An item was clicked
        this.hide()
      }
    } else if (this.state.expanded) {
      // Click was outside the dropdown. Close the menu if it was open
      this.hide()
    }
  }
  componentDidMount () {
    window.addEventListener('click', this.handleClick)
  }
  componentWillUnmount () {
    window.removeEventListener('click', this.handleClick)
  }
  render () {
    const { dropdownHeading, children } = this.props
    let icon = <span className='dropdown-toggle' ref={node => { this.toggleRef = node }}>&#9660;</span>
    if (this.props.icon) {
      icon = <span className='dropdown-toggle' ref={node => { this.toggleRef = node }}>{this.props.value || ''}{this.props.icon}</span>
    }
    return (
      <div className={`DropDown ${this.props.className || ''}`} ref={node => { this.dropdownRef = node }}>
        {icon}
        <div className={'dropdown-menu' + (this.state.expanded ? '' : ' hidden')}>
          {dropdownHeading}
          <div className='dropdown-items'>
            {children}
          </div>
        </div>
      </div>
    )
  }
}

function DropDownItem (props) {
  const additionalClassName = props.className ? props.className : ''
  return (
    <div className={`dropdown-item ${additionalClassName}`} onClick={props.onClick}>{props.children}</div>
  )
}

const ICONS = {
  HELLIP,
  VELLIP
}

export {
  DropDown,
  DropDownItem,
  ICONS
}
