import React, { Component } from 'react'
import logo from './images/logo.png'
import './style.css'

export default class Header extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    }
    this.handleClick = this.handleClick.bind(this)
    this.toggle = this.toggle.bind(this)
    this.hide = this.hide.bind(this)
  }
  componentDidMount () {
    window.addEventListener('click', this.handleClick)
  }

  componentWillUnmount () {
    window.removeEventListener('click', this.handleClick)
  }

  toggle () {
    this.setState((prevState) => {
      return {
        expanded: !this.state.expanded
      }
    },
    () => {
      document.body.style.overflow = this.state.expanded ? 'hidden' : 'auto'
    })
  }

  hide () {
    this.setState({
      expanded: false
    })
    document.body.style.overflow = 'auto'
  }

  handleClick (e) {
    if (this.toggleRef.contains(e.target)) {
      this.toggle()
    } else {
      this.hide()
    }
  }
  render () {
    let { current } = this.props
    const { expanded } = this.state
    return (
      <header className='common-header'>
        <div className='relative'>
          <div className='wrap'>
            <a href={'/'} className='logo-link'><img className='logo' src={logo} alt='IPH Logo' /></a>
            <div className='menu-button-container'>
              <div className={`hamburger ${expanded ? 'close' : ''}`.trim()} ref={node => { this.toggleRef = node }}>
                <span />
                <span />
                <span />
              </div>
              <nav className={`site-nav ${expanded ? 'expanded' : ''}`.trim()}>
                <ul>
                  <li><a href={'/login'} className={`${current === 'contact' ? 'current' : ''}`}>SIGN IN</a></li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>
    )
  }
}
