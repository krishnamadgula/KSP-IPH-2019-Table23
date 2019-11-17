import React, { Component, createContext } from 'react'
import { post } from '../../lib/fetch'
import {Router} from 'react-router-dom'

const isEmpty = (obj = {}) => {
  return Boolean(!(obj && Object.keys(obj).length))
}

const { Provider, Consumer } = createContext({
  accountData: {},
  login: () => {},
  logout: () => {},
})

export const DATA_KEY = 'account'
export const AUTH_TOKEN_KEY = 'auth_token'

class AuthProvider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      accountData: {},
    }

    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
  }


  componentDidUpdate(prevProps, prevState) {
    if (prevState.accountData !== this.state.accountData) {
      const { token } = this.state.accountData
      if (token !== undefined) {
        if (this.state.accountData.account) {
          window.localStorage.setItem(
            'account',
            JSON.stringify(this.state.accountData.account)
          )
        }
      } else {
        window.localStorage.removeItem('account')
      }
    }
  }

  componentDidMount() {
    let { auth_token } = this.props
    let account = window.localStorage.getItem('account')
    if (auth_token) {
      let accountData = {
        token: auth_token,
        account: account ? JSON.parse(account) : {},
      }
      this.setState({
        accountData,
      })
    }
  }

  async login(data) {
    try {
      let json = await post(`auth`, {
        body: JSON.stringify(data),
      })

      this.setState(
        {
          accountData: {
            ...json.data,
          },
        },
        this.setDomain
      )
    } catch (error) {
      throw error
    }
  }

  logout() {
    this.setState(
      {
        accountData: {},
      },
      () => {
        Router.push('/')
      }
    )
  }

  render() {
    let { children } = this.props
    return (
      <Provider
        value={{
          accountData: this.state.accountData.account,
          login: this.login,
          logout: this.logout,
          isLoggedIn: !isEmpty(this.state.accountData),
        }}
      >
        {children}
      </Provider>
    )
  }
}

const AuthConsumer = Consumer

export default AuthProvider

export { AuthConsumer }
