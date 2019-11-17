import 'sanitize.css/sanitize.css'
import React, { Component } from 'react'
import Router from './router'
import { getLocale, setLocale } from '../../lib/translator'
import { isLoggedIn } from '../../lib/auth'
import '../../lib/polyfills'
import './app.css'
import { messageHandler } from '../../lib/internalDashboard/internalDashboard'
class App extends Component {
  componentDidMount () {
    if (window) {
      // for handling communication with internal-dashboard to handle certain actions
      window.onload = function () {
        window.addEventListener('message', messageHandler)
      }
    }
  }
  componentWillUnmount () {
    if (window) {
      window.removeEventListener('message', messageHandler)
    }
  }
  render () {
    let locale = getLocale()
    if (!locale.language) {
      locale.language = 'en'
    }
    setLocale(locale)
    return (
      <Router isLoggedIn={isLoggedIn()} />
    )
  }
}
export default App
