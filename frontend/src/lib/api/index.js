import { getAuthToken, isExtensionEnabled, getSession } from '../auth'
import { GO_HOST } from '../../config/app.js'
import { get, set } from '../storage'
import axios from 'axios'

const ServiceHostMapping = {
  'account-service': GO_HOST,
  'billing-service': GO_HOST,
  'blog-service': GO_HOST,
  'catalogue-service': GO_HOST,
  'communication-service': GO_HOST,
  'customer-service': GO_HOST,
  'logistics-service': GO_HOST,
  'media-service': GO_HOST,
  'order-service': GO_HOST,
  'promo-service': GO_HOST,
  'ticket-service': GO_HOST,
  'website-service': GO_HOST,
  'public-service': GO_HOST,
  'offer-service': GO_HOST,
  'inventory-service': GO_HOST,
  'config-service': GO_HOST
}

/**
 * @description
 * Checking redirect form internal dashboard or not
 */
export const isInternal = () => {
  return get('redirectedFrom') === 'internal_dashboard'
}

/**
 * @description
 * adding organizationId to every request when login throw internal dashboard
 */
const getParams = (params, api) => {
  let organization = getSession().organization
  const organizationId = new URL(window.location).searchParams.get('organizationId') || (organization && organization.id)
  if (api.includes('/account-service/user')) {
    params.isOwner = 1
  }
  params.organizationId = organizationId + ''
  let parameters = {...params}
  return parameters
}

// const possibleExceptions = ['validation exception', 'auth exception', 'model exception', 'resource not found', 'invalid request', 'server error']
class API {
  constructor ({url}) {
    this.signal = axios.CancelToken.source()
    this.guid = new URL(window.location).searchParams.get('guid')
    if (url && url[0] === '/') {
      // Get the host based on the service
      const service = url.split('/')[1]
      const api = ServiceHostMapping[service]
      this.url = api + url
    } else {
      this.url = url
    }
  }
  get (params = {}, headers = {}) {
    if (this.guid) {
      params.guid = this.guid
    }
    return call(this.url, 'GET', params, this.signal.token, headers)
  }
  post (params = {}, headers = {}) {
    return call(this.url, 'POST', params, this.signal.token, headers)
  }
  put (params = {}, headers = {}) {
    return call(this.url, 'PUT', params, this.signal.token, headers)
  }
  delete (params = {}, headers = {}) {
    return call(this.url, 'DELETE', params, this.signal.token, headers)
  }
  cancel () {
    return this.signal.cancel('API call cancelling')
  }
}

function call (api, method, params, signal, headers) {
  if (isInternal()) {
    params = {...params, ...getParams(params, api)}
  }
  let options = {
    method: method,
    headers: {}
  }
  if (api.includes('/logistics-service/delivery-area')) {
    options.headers['X-API-VERSION'] = 2
  }
  if (isExtensionEnabled('MultiLingualSupport') && api && api.includes('/catalogue-service/')) {
    options.headers['Accept-Language'] = get('dataLang') || 'en'
  }
  if (isExtensionEnabled('MultiLingualSupport') && api && api.includes('/account-service/store')) {
    options.headers['Accept-Language'] = get('dataLang') || 'en'
  }
  options.headers = {...options.headers, ...headers}

  switch (method) {
    case 'GET':
      let querystring = ''
      if (params) {
        for (let key in params) {
          if (params[key]) {
            querystring += (querystring.length ? '&' : '') + key + '=' + encodeURIComponent(params[key])
          }
        }
      }
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
      api = api + ((querystring) ? '?' + querystring : '')
      break
    case 'PUT':
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(params)
      break
    case 'POST':
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(params)
      if (params instanceof FormData) {
        delete options.headers['Content-Type']
        options.body = params
      }
      break
    case 'DELETE':
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(params)
      break
    default:
      break
  }

  let host = api.split('/', 3).join('/')
  let sendAccessToken = host === GO_HOST
  let accessToken = getAuthToken()
  if (api.includes('/logistics-service/delivery-area')) {
    options.headers['X-API-VERSION'] = 2
  }
  if (params.guid) {
    options.headers['Authorization'] = 'Bearer ' + params.guid
    set('token', params.guid)
  } else if (sendAccessToken && accessToken) {
    options.headers['Authorization'] = 'Bearer ' + accessToken
  }

  return axios({
    url: api,
    method: method.toLowerCase(),
    headers: options.headers,
    data: options.body,
    validateStatus: status => {
      return status === 200
    },
    responseType: 'json',
    cancelToken: signal
  }).then(response => {
    return Promise.resolve(response.data)
  }).catch(error => {
    if (axios.isCancel(error)) {
      return Promise.reject({
        message: 'cancelled'
      })
    }
    return Promise.reject({
      code: error.response && error.response.data && error.response.data.code,
      message: error.response && error.response.data && error.response.data.message,
      url: api,
      method: method
    })
  })
}

export default API
