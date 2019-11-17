import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import Login from '../../pages/others/Login'
import MissingPage from '../../pages/others/MissingPage'
import Verify from '../../pages/others/Verify'


import Designations from '../../pages/hr/Designations'
import UserShifts from '../../pages/hr/UserShifts'

import { isExtensionEnabled, getPermissions, isEnterprise, modifyMenuForEnterprise, modifyEnterprisePermissions, saveSession } from '../../lib/auth'
import API, { isInternal } from '../../lib/api'
import { get, set } from '../../lib/storage'

function hasAccess ({ endpoints, extensions = [] }) {
  let hasExtensionsEnabled = extensions.map(isExtensionEnabled).reduce((acc, value) => acc && value, true)
  let hasApiPermissions = !endpoints || !endpoints.length ? true : Object.values(getPermissions(endpoints)).reduce((acc, value) => {
    if (value instanceof Object) {
      return acc && Object.values(value).reduce((acc, value) => acc || value, false)
    } else {
      return acc && value
    }
  }, true)
  return hasApiPermissions && hasExtensionsEnabled
}

export default class Router extends Component {
  constructor (props) {
    super(props)
    let url = new URL(window.location)
    if (url.searchParams.get('guid')) {
      this.state = {
        refresh: true
      }
    } else {
      this.state = {
        refresh: false
      }
    }
  }
  render () {
    const { props } = this
    // Only list mandatory API endpoints/extensions here
    const requiredPermissions = {
      'employee-management': [
        {
          slug: 'employees',
          endpoints: [
            'account-service/employee',
            'account-service/designation'
          ],
          extensions: ['HrManagement']
        },
        {
          slug: 'designations',
          endpoints: [
            'account-service/designation'
          ],
          extensions: ['HrManagement']
        },
      ]
    }

    if (isEnterprise()) {
      requiredPermissions.settings = modifyEnterprisePermissions()
    }

    const getPagePermissions = function (url) {
      let path = url.split('/').filter(Boolean)
      let permissions = requiredPermissions[path[0]].find(obj => obj.slug === path[1])
      return (({ endpoints, extensions }) => ({ endpoints, extensions }))(permissions)
    }

    let menu = Object.assign({}, ...Object.keys(requiredPermissions).map(key => {
      let permissions = requiredPermissions[key]
      return {
        [key]: permissions.filter(hasAccess).map(({ slug }) => slug)
      }
    }))

    // Prune menu sections which have no links in them
    for (let section in menu) {
      if (!menu[section].length) {
        delete menu[section]
      }
    }

    const isLoggedIn = props.isLoggedIn

    const getUserDetails = () => {
      let userAPI = new API({ url: '/account-service/user' })
      return userAPI.get().then((response) => {
        return response.data.user[0]
      }).then(({id}) => {
        let user = new API({ url: `/account-service/user/${id}` })
        return user.get()
      })
    }
    const getBackOfficeAPIDetails = () => {
      let backOfficeApi = new API({ url: '/config-service/config/backOffice' })
      return backOfficeApi.get()
    }

    const getOrganizationDetails = (organizationId) => {
      const organizationAPI = new API({ url: `/account-service/organization/${organizationId}` })
      return organizationAPI.get()
    }

    const PrivateRoute = ({ component: Component, ...rest }) => {
      let endpoints = []
      let extensions = []
      let hasPageAccess = true
      let location = new URL(JSON.parse(JSON.stringify(window.location)).href)
      let redirectedFrom = location.searchParams.get('redirectedFrom')
      let organizationId = location.searchParams.get('organizationId')
      redirectedFrom && set('redirectedFrom', redirectedFrom)
      if (location.searchParams.get('guid') && this.state.refresh) {
        if (isInternal()) {
          Promise.all([getUserDetails(), getOrganizationDetails(organizationId), getBackOfficeAPIDetails()]).then(([userResponse, organizaitonResponse, backOfficeResponse]) => {
            let user = userResponse.data.user
            saveSession({
              user: user,
              organization: organizaitonResponse.data.organization
            })
            this.setState({
              refresh: false
            })
          })
        } else {
          const api = new API({ url: '/account-service/me' })
          const extnApi = new API({ url: '/account-service/extension' })
          Promise.all([
            api.get(),
            extnApi.get()
          ]).then(([
            response, extnResponse
          ]) => {
            saveSession({
              user: response.data.user,
              organization: {extension: extnResponse.data.extension, currency: { symbol: '' }}
            })
            this.setState({
              refresh: false
            })
          },
          error => {
            throw error
          })
        }
      }
      let hasPermissionsInfo = Boolean(getPermissions())
      let redirectToLogin = !isLoggedIn || !hasPermissionsInfo
      if (location.searchParams.get('guid') && hasPermissionsInfo) {
        redirectToLogin = false
      }
      if (endpoints.length || extensions.length) {
        let temp = getPagePermissions(rest.path)
        endpoints = temp.endpoints
        extensions = temp.extensions
        hasPageAccess = hasAccess({ endpoints, extensions })
      }
      if (isEnterprise()) {
        menu = modifyMenuForEnterprise(menu)
      }
      if (get('user') && JSON.parse(get('user'))) {
        let user = JSON.parse(get('user'))
        if (!user.isOwner) {
          delete menu.settings
        }
        let roles = user.designation && user.designation.roles && user.designation.roles
        if (roles && roles.length === 1) {
          let role = roles[0]
          if (role.name === 'Transport Coordinator') {
            delete menu.hr
          }
        }
      }
      return (
        !this.state.refresh && <Route
          {...rest}
          render={props => (
            !redirectToLogin ? (
              hasPageAccess ? (
                <Component
                  {...props}
                  menu={menu}
                  rerender={() => {
                    // TODO: Provide a better way to figure out how to re-render when permissions change,
                    // perhaps by maintaining a state which contains permissions
                    this.setState({})
                  }}
                />
              ) : (
                <MissingPage />
              )
            ) : (
              <Redirect to={{
                pathname: isLoggedIn ? '/user/logout' : '/login',
                state: { from: props.location }
              }} />
            )
          )
          }
        />
      )
    }
    return (
      <Switch >
        { /* Default second level menu option for each top level menu */ }
        <Redirect exact from='/' to='/login' />
        <Route path='/login' component={Login} />
        <Route path='/verify' component={Verify} />

        {/* For each route, we should have exactly one component */}

        <PrivateRoute path='/designations' component={Designations} />
        <PrivateRoute path='/employees/:action?/:id?' component={UserShifts} exact />

        <Route component={MissingPage} />
      </Switch>
    )
  }
}
