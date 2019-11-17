import React, { Component } from 'react'
import debounce from 'lodash/debounce'

function getMobileView () { return window.screen.width <= 480 }

class MobileView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isMobileView: getMobileView()
    }
    this.mobileView = debounce(this.mobileView.bind(this), 350)
  }

  mobileView () {
    this.setState({isMobileView: getMobileView()})
  }

  componentDidMount () {
    window.addEventListener('resize', this.mobileView, false)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.mobileView, false)
  }
  render () {
    return (<div />)
  }
}

export default MobileView
