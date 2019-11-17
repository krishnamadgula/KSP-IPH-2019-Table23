import React, {Component} from 'react'
import './style.css'
// TODO include dropdown component
export default class DropdownWithOptions extends Component {
  render () {
    let {props} = this
    let options = props.options.map(function (option, i) {
      return (
        <div className='selected' >
          <button>{option}<span value={option} onClick={props.handleClick.bind(this, {option})} /></button>
        </div>
      )
    })
    return (
      <div className='DropdownWithOptions'>
        {options}
      </div>
    )
  }
}
