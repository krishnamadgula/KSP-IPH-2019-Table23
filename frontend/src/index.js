import React from 'react'
import ReactDOM from 'react-dom'
import App from './containers/App/App'
// import { unregister } from './registerServiceWorker'
import {BrowserRouter as Router} from 'react-router-dom'
import 'react-app-polyfill/ie9'

ReactDOM.render(<Router><App /></Router>, document.getElementById('root'))
// registerServiceWorker() // TODO: Implement service worker to enable offline experience
// unregister()
