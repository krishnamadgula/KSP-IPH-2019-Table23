import React from 'react'
import Header from '../../components/Header'
import { Provider } from '../Context'

import './style.css'

export default function PublicPage (props) {
  let enterprise = true
  let subDomain = window.location.hostname.split('.')[0]
  if (subDomain === 'dashboard' || subDomain === 'localhost') {
    enterprise = false
  }
  return (
    <Provider value={enterprise}>
      <div className={'fullWidthPage eazy-page ' + props.className}>
        {props.showHeader && <header className='global-header'>
          <Header eazy />
        </header>}
        <main>
          {props.children}
        </main>
        <footer className='page-footer'>
        </footer>
      </div>
    </Provider>
  )
}
PublicPage.defaultProps = {
  showHeader: true
}
