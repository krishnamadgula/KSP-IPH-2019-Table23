import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import Menu, { NavigationDrawer } from '../../components/Menu'
import { getMessage } from '../../lib/translator'
import { isExtensionEnabled, getStores, setStores, getSession } from '../../lib/auth'
import { set, get } from '../../lib/storage'
import API from '../../lib/api'

const httpStatusMessages = {
  403: getMessage('error.server.403')
}
export default class AuthenticatedPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: '',
      httpStatus: 200
    }
    this.title = props.title
    this.handleError = this.handleError.bind(this)
  }
  componentWillMount () {
    window.addEventListener('unhandledrejection', this.handleError)
  }

  componentWillUnmount () {
    window.removeEventListener('unhandledrejection', this.handleError)
  }

  componentDidMount () {
    if (isExtensionEnabled('MultiStoreSupport')) {
      if (!getStores()) {
        const api = new API({ url: '/account-service/store' })
        api.get({ paginate: 'false' }).then(
          response => {
            let stores = response.data.store.reverse()
            let user = getSession() && getSession().user
            if (user && user.stores && user.stores.length > 0) {
              stores = user.stores.reverse()
              setStores(stores)
              set('store', stores[0].id)
            }
            setStores(stores)
            set('store', stores[0].id)
            this.setState({
              stores,
              storeId: stores[0].id
            })
            this.props.setApiParam && this.props.setApiParam(stores[0].id)
          }
        )
      } else {
        this.setState({
          stores: getStores()
        })
      }
    } else {
      if (!get('store')) {
        const orgId = getSession().organization && getSession().organization.id
        if (orgId) {
          const api = new API({ url: `/account-service/organization/${orgId}` })
          api.get().then(
            response => {
              const storeId = response.data.organization.defaultStore && response.data.organization.defaultStore.id
              const stores = [response.data.organization.defaultStore]
              set('store', storeId)
              setStores(stores)
              this.setState({
                storeId: storeId,
                stores
              })
            }
          )
        }
      } else {
        this.setState({
          stores: getStores(),
          storeId: get('store')
        })
      }
    }
  }

  handleError (e) {
    e.preventDefault()
    const newState = Object.assign({}, this.state)
    if (e.reason.code === 401) {
      newState.redirectToLogin = true
    } else if (e.reason.message === 'cancelled') {
      newState.error = ''
      newState.httpStatus = 200
      this.setState(newState)
    } else {
      newState.httpStatus = e.reason.code
      newState.error = e.reason.message
    }
    console.error(e.reason.message)
    this.setState(newState)
  }

  updateStore (storeId) {
    this.setState({
      storeId: storeId
    }, () => this.props.onChange && this.props.onChange())
  }

  render () {
    const { props } = this
    let menuProps = {
      items: props.menu
    }
    if (props.storeDependent && isExtensionEnabled('MultiStoreSupport')) {
      menuProps.stores = this.state.stores
      menuProps.storeId = this.state.storeId
    }
    if (props.showLanguageDropDown) {
      menuProps.showLanguageDropDown = true
    }

    return this.state.redirectToLogin
      ? <Redirect to='/user/logout' />
      : (
        <div id='app'>
          {props.menu ? <Menu {...menuProps} onChange={(e) => this.updateStore(e)} /> : null}
          <main className={props.className}>
            {props.menu ? <NavigationDrawer /> : null}
              {this.state.error ? <div><h1>{this.title}</h1>{httpStatusMessages[this.state.httpStatus] || getMessage('error.server')}</div>
                : props.children}
          </main>
        </div>
      )
  }
}
