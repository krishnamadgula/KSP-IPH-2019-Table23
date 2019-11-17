// Features:
// 1. accept token
// 2. save token to storage
// 3. auto-load token from storage

const saveSession = function (sessionData) {
  for (let key in sessionData) {
    if (sessionData[key]) {
      if (key === 'user') {
        savePermissions(sessionData[key].endpointPermissions)
        delete sessionData[key].endpointPermissions
      }
      window.localStorage.setItem(key, (typeof sessionData[key] === 'object') ? JSON.stringify(sessionData[key]) : sessionData[key])
    }
  }
}

// Checks if user has permissions to make a request to server
// For endpoint like order-service/order-log with method PUT
// service = order, endpoint = orrder-log, method = put/PUT
const hasPermissions = (service, endpoint, method) => {
  if (!service || !endpoint || !method) {
    return false
  }
  let permissions = JSON.parse(window.localStorage.getItem('formattedPermissions'))
  if (!permissions) {
    permissions = getAllPermissions()
    window.localStorage.setItem('formattedPermissions', JSON.stringify(permissions))
  }
  let key = `${service}-service/${endpoint}`
  return permissions[key] && permissions[key][method.toUpperCase()]
}

const savePermissions = function (permissions = []) {
  let formatted = Object.assign({}, ...permissions.map(permission => {
    return {
      [permission.url]: permission
    }
  }))
  window.localStorage.setItem('permissions', JSON.stringify(formatted))
  let formattedPermissions = getAllPermissions()
  window.localStorage.setItem('formattedPermissions', JSON.stringify(formattedPermissions))
}

const getPermissions = function (endpoints = []) {
  let permissions = JSON.parse(window.localStorage.getItem('permissions'))
  if (!permissions) {
    return false
  }
  return Object.assign({}, ...endpoints.map((endpoint) => {
    if (endpoint in permissions) {
      return {
        [endpoint]: permissions[endpoint].allowedMethods
      }
    } else {
      return {
        [endpoint]: false
      }
    }
  }))
}

const getAllPermissions = function () {
  let permissions = JSON.parse(window.localStorage.getItem('permissions'))
  return Object.assign({}, ...Object.keys(permissions).map(endpoint => ({
    [endpoint]: permissions[endpoint]['allowedMethods']
  })))
}

const getAuthToken = function () {
  let token = window.localStorage.getItem('token')
  return token
}

const getSession = function () {
  return {
    organization: JSON.parse(window.localStorage.getItem('organization')),
    user: JSON.parse(window.localStorage.getItem('user'))
  }
}

const getStores = () => {
  return JSON.parse(window.localStorage.getItem('stores'))
}

const sortStores = (storesArr) => {
  return storesArr.sort((a, b) => {
    if (a.text > b.text) {
      return 1
    } else if (b.text > a.text) {
      return -1
    } else {
      return 0
    }
  })
}

const setStores = (stores) => {
  return window.localStorage.setItem('stores', JSON.stringify(stores))
}

const clearSession = function () {
  let organizationName = window.localStorage.getItem('organization-name')
  let language = window.localStorage.getItem('language')
  window.localStorage.clear()
  if (organizationName && organizationName !== 'null') {
    window.localStorage.setItem('organization-name', organizationName)
  }
  window.localStorage.setItem('language', language)
}

const isLoggedIn = function () {
  return Boolean(getAuthToken())
}

const isAccountVerified = function () {
  let session = getSession()
  return session.user.verified
}

const verifyAccount = function () {
  let session = getSession()
  session.user.verified = true
  saveSession(session)
}

const isExtensionEnabled = function (slugOrId) {
  let organization = JSON.parse(window.localStorage.getItem('organization'))
  if (!organization) {
    return false
  }
  let enabled
  if (typeof slugOrId === 'string') {
    let slug = slugOrId
    enabled = (organization.extension || []).findIndex(ext => ext.slug === slug) > -1
  } else {
    let id = slugOrId
    enabled = (organization.extension || []).findIndex(ext => ext.id === id) > -1
  }
  return enabled
}

const disableExtension = function (extension) {
  let organization = JSON.parse(window.localStorage.getItem('organization'))
  if (!organization.extension) {
    organization.extension = []
  }
  organization.extension = organization.extension.filter(ext => ext.id !== extension.id)
  window.localStorage.setItem('organization', JSON.stringify(organization))
}

const enableExtension = function (extension) {
  let organization = JSON.parse(window.localStorage.getItem('organization'))
  if (!organization.extension) {
    organization.extension = []
  }
  organization.extension.push(extension)
  window.localStorage.setItem('organization', JSON.stringify(organization))
}

const isEnterprise = () => {
  let userInfo = getSession()
  return Boolean(userInfo.organization && userInfo.organization.isEnterprise)
}

const modifyMenuForEnterprise = (menu) => {
  let newMenu = {...menu}
  if (!isExtensionEnabled('Marketing')) {
    delete newMenu.marketing
  }
  newMenu.user = menu.user.slice(1)
  return newMenu
}
// TODO: Get this from API response
// const configureableExtensions = [
//   'MultiUserSupport',
//   'MultiStoreSupport',
//   'InStoreProcessing',
//   'LogisticsSupport',
//   'DeliveryAreaSupport',
//   'Analytics',
//   'TawkToLiveChat',
//   'Seo',
//   'OnlinePaymentSupport',
//   'EntityMetaData',
//   'DeliverySlots',
//   'CustomerTags',
//   'StockOverride',
//   'SearchOverride'
// ]

const getConfigureableExtensions = () => {
  let extensions = []
  if (hasPermissions('account', 'store', 'get')) {
    extensions.push('MultiStoreSupport')
  }
  if (hasPermissions('account', 'user', 'get')) {
    extensions.push('MultiUserSupport')
  }
  if (hasPermissions('account', 'extension', 'get')) {
    extensions.push('InStoreProcessing')
  }
  if (hasPermissions('logistics', 'delivery-area', 'get')) {
    extensions.push('DeliveryAreaSupport')
  }
  if (hasPermissions('account', 'config', 'get')) {
    extensions.push('LogisticsSupport')
  }
  if (hasPermissions('account', 'config', 'get')) {
    extensions.push('Analytics')
  }
  if (hasPermissions('account', 'extension', 'get')) {
    extensions.push('TawkToLiveChat')
  }
  if (hasPermissions('account', 'seo', 'get')) {
    extensions.push('Seo')
  }
  if (hasPermissions('config', 'meta-data', 'get')) {
    extensions.push('EntityMetaData')
  }
  if (hasPermissions('account', 'extension', 'get') && hasPermissions('order', 'slot', 'get')) {
    extensions.push('DeliverySlots')
  }
  if (hasPermissions('customer', 'tag', 'get')) {
    extensions.push('CustomerTags')
  }
  if (hasPermissions('catalogue', 'stock-override', 'get')) {
    extensions.push('StockOverride')
  }
  if (hasPermissions('catalogue', 'product-ranking', 'get')) {
    extensions.push('SearchOverride')
  }
  return extensions
}

const slugs = {
  'MultiUserSupport': 'users',
  'MultiStoreSupport': 'stores',
  'MultiVariantSupport': 'variants',
  'InStoreProcessing': 'instore',
  'DeliveryAreaSupport': 'delivery-area',
  'Analytics': 'analytics',
  'TawkToLiveChat': 'tawk',
  'Seo': 'seo',
  'OnlinePaymentSupport': 'payment-configuration',
  'EntityMetaData': 'metadata',
  'DeliverySlots': 'slots',
  'LogisticsSupport': 'logistics-configuration',
  'CustomerTags': 'customer-tags',
  'StockOverride': 'store-configuration',
  'SearchOverride': 'search-configuration'
}

let firstSubmenu = ''

const modifyEnterprisePermissions = () => {
  let extensions = getSession().organization && getSession().organization.extension
  let configureableExtensions = getConfigureableExtensions()
  let menu = extensions.map((extension, index) => {
    if (configureableExtensions.indexOf(extension.slug) > -1) {
      if (firstSubmenu === '') {
        firstSubmenu = slugs[extension.slug]
      }
      return {
        slug: slugs[extension.slug],
        extensions: [extension.slug]
      }
    }
    return null
  }).filter(Boolean)

  if (getSession().organization.domain && hasPermissions('account', 'theme', 'get') && hasPermissions('website', 'layout', 'get')) {
    menu.push({
      slug: 'themes'
    })
  }
  if (hasPermissions('config', 'config', 'GET')) {
    menu.push({
      slug: 'communication-configuration'
    })
  }
  return menu
}
const getExtensionDetails = (slug) => {
  let organization = JSON.parse(window.localStorage.getItem('organization'))
  if (!organization) {
    return null
  }
  let index
  index = (organization.extension || []).findIndex(ext => ext.slug === slug)
  if (index > -1) {
    return organization.extension[index]
  }
  return null
}

const saveEntityMetaData = (entityMetaDataConfig) => {
  window.localStorage.setItem('entityMetaDataConfig', JSON.stringify(entityMetaDataConfig))
}

const getEntityMetaData = () => {
  return JSON.parse(window.localStorage.getItem('entityMetaDataConfig'))
}

const getStoreSelect = () => {
  let stores = getStores()
  let data = stores && stores.map(store => {
    return {
      text: store.name,
      value: store.id
    }
  })
  return data
}

const getStoreIds = () => {
  let stores = getStores()
  let data = stores && stores.map(store => store.id)
  return data
}

const extensionRoutes = {
  OnlinePaymentSupport: '/settings/payment-configuration',
  Seo: '/settings/seo',
  DeliveryAreaSupport: '/settings/delivery-area',
  MultiStoreSupport: '/settings/stores',
  MultiUserSupport: '/settings/users',
  DeliverySlots: '/settings/slots',
  LogisticsSupport: '/settings/logistics-configuration',
  CustomerTags: '/settings/customer-tags',
  StockOverride: '/settings/store-configuration',
  SearchOverride: '/settings/search-configuration'
}

export {
  clearSession,
  disableExtension,
  enableExtension,
  getAllPermissions,
  getAuthToken,
  getPermissions,
  getSession,
  isExtensionEnabled,
  isLoggedIn,
  isAccountVerified,
  saveSession,
  verifyAccount,
  isEnterprise,
  modifyMenuForEnterprise,
  saveEntityMetaData,
  getEntityMetaData,
  getExtensionDetails,
  extensionRoutes,
  modifyEnterprisePermissions,
  firstSubmenu,
  getStores,
  setStores,
  hasPermissions,
  getStoreSelect,
  getStoreIds,
  sortStores
}
