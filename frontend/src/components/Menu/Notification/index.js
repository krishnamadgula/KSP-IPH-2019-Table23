import React, {Component, Fragment} from 'react'
import NotificationBox from './NotificationBox'
import Image from '../../Image'
import { getMessage } from '../../../lib/translator'
import notificationImage from './notification-empty.svg'
import './style.css'

export default class Notification extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showModal: false
    }
    this.modalClose = this.modalClose.bind(this)
    this.showModal = this.showModal.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  modalClose (event) {
    if (event) {
      event.stopPropagation()
    }
    this.setState({
      showModal: false
    })
  }

  showModal () {
    this.state.showModal ? this.modalClose() : this.setState({showModal: true})
  }

  handleClick (e) {
    if (!(this.toggleRef.contains(e.target) && e.target.className !== 'close-icon')) {
      this.modalClose()
    }
  }

  componentDidMount () {
    window.addEventListener('click', this.handleClick)
  }
  componentWillUnmount () {
    window.removeEventListener('click', this.handleClick)
  }

  render () {
    return (
      <Fragment>
        <div className='notificationToday icon-notification menu-toggle-container' ref={node => { this.toggleRef = node }} onClick={this.showModal}>
          { this.state.showModal
            ? <NotificationBox title='Notifications' close={this.modalClose} >
              <div>
                <div className='emptyNotification'>
                  <Image src={notificationImage} />
                </div>
                <div className='notificationText'>
                  <p>{getMessage('menu.notificationToday.empty')}</p>
                </div>
              </div>
            </NotificationBox> : null
          }
        </div>
      </Fragment>
    )
  }
}
