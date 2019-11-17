import React, { Component } from 'react'
import ReactDOM from 'react-dom'

export default class PopupModal extends Component {
  constructor () {
    super()
    this.checkESC = this.checkESC.bind(this)
    this.checkClick = this.checkClick.bind(this)
  }
  checkESC (event) {
    // Check if ESC key is pressed
    if (event.which === 27) {
      this.props.close()
    }
  }
  checkClick (event) {
    // Check if the target is modal-backdrop
    if (this.modalRef === event.target) {
      this.props.close()
    }
  }
  componentWillMount () {
    if (this.props.show) {
      document.body.style.overflow = 'hidden' // Todo: Figure out a better way without touching the DOM
    }
  }
  componentDidMount () {
    if (this.props.show) {
      this.modalRef && this.modalRef.focus()
    }
  }
  componentDidUpdate (prevProps, prevState) {
    if (this.props.show !== prevProps.show) {
      this.modalRef && this.modalRef.focus()
    }
  }
  componentWillUnmount () {
    document.body.style.overflow = 'auto'
  }

  render () {
    const { props } = this
    if (props.show) {
      return ReactDOM.createPortal(
        <div className='modal-backdrop' ref={node => { this.modalRef = node }} onKeyDown={this.checkESC} onClick={this.checkClick} tabIndex='0'>
          {props.children}
        </div>, document.getElementById('portal')
      )
    }
    return null
  }
}
