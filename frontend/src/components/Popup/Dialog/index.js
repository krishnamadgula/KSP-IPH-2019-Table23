import React from 'react'
import './style.css'
import PopupModal from '../Modal'

export default class Dialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      submitting: false
    }
    this.handleOk = this.handleOk.bind(this)
  }
  handleOk () {
    const { onOk } = this.props
    this.setState({submitting: true}, onOk)
  }
  componentWillReceiveProps () {
    // Enable okay button for the second time
    if (this.props.show === false && this.state.submitting === true) {
      this.setState({submitting: false})
    }
  }
  render () {
    const { show, title, message, information, close, closeText, className, onOk, okText } = this.props
    return (
      <PopupModal show={show} close={close}>
        <div className='dialogPopup'>
          <div className={className || 'warn'}>
            <div className='image' />
            <div>
              {title}
            </div>
            <div className='description'>
              {message}
            </div>
            {information && <p>
              {information}
            </p>}
            <button type='button' className='button' onClick={close}>{closeText}</button>
            {onOk && <button type='button' className='primary button' onClick={this.handleOk} disabled={this.state.submitting || false} >{okText}</button>}
          </div>
        </div>
      </PopupModal>
    )
  }
}
