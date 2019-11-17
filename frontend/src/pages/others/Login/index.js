import React, { Fragment } from 'react'
import PublicPage from '../../../containers/PublicPage/index'
import LoginForm from './form'
import { Consumer } from '../../../containers/Context'

import { getMessage } from '../../../lib/translator'

export default class Login extends React.Component {
  render () {
    return (
      <PublicPage className='login'>
        <Consumer>
          {
            (isEnterprise) => (
              <Fragment>
                <header className='header'>
                  <h1 className='heading'>{getMessage('login.heading')}</h1>
                  <h2 className='subheading'>{getMessage('login.subheading')}</h2>
                </header>
                <div className='box'>
                  <LoginForm enterprise={isEnterprise} />
                </div>
              </Fragment>
            )
          }
        </Consumer>
      </PublicPage>
    )
  }
}
