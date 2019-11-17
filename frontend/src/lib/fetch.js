import fetch from 'isomorphic-unfetch'

const AUTH_TOKEN_KEY = 'auth_token'

const API_URL = '/'

const parseJSON = response => {
  return response.text().then(function(text) {
    try {
      return text ? JSON.parse(text) : {}
    } catch (error) {
      //in most cases, this error is caused by response is not following JSON format
      return {}
    }
  })
}

const parseResponse = (response, method = 'get') => {
  if (response && response.status === 'SUCCESS' && response.code === 200) {
    return response.data
  } else {
    if (method === 'get') {
      return []
    }
    return undefined
  }
}

class InvalidHTTPError extends Error {
  constructor({ name, message, code, responseStatus }) {
    super()
    this.name = name
    this.message = message
    this.code = code
    this.responseStatus = responseStatus
  }
}

const headersWithAuthToken = authToken => {
  const obj = {
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    Accept: 'application/json',
    // 'Content-Type': 'application/json',
    'Accept-Language': 'en',
  }
  return obj
}

// Use this like `await get('url', { headers: headers(ctx) })`
// to include headers with Bearer Token.

// NOTE: The argument `context` is optional.
const headers = context => {
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY)
  return headersWithAuthToken(authToken)
}

const fetcher = init => async (url, params) => {
  const isAbsoluteUrl =
    url && (url.indexOf('http://') > -1 || url.indexOf('https://') > -1)
  let apiURL = isAbsoluteUrl ? url : `${API_URL}/${url}`

  let resp
  try {
    resp = await fetch(apiURL, { ...init, ...params })
  } catch (error) {
    throw error
  }

  if (!resp.ok) {
    let error = await parseJSON(resp)
    throw new InvalidHTTPError(error)
  }
  return resp.json()
}

const get = fetcher({ method: 'get' })

const post = fetcher({ method: 'post' })

const put = fetcher({ method: 'put' })

const del = fetcher({ method: 'delete' })

export { get, put, post, del, headers, parseResponse }
