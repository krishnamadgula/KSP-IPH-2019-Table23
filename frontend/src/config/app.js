/*
  This file exists in src/ folder due to limitations set by create-react-app
*/

let api = window.location.hostname.split('.').slice(1).join('.')
let GO_HOST = `${window.location.protocol}//api.${api}`
if (api === '') {
  GO_HOST = process.env.REACT_APP_API_HOST || 'http://api.staging.zopsmart.com'
}
let IS_STAGING = GO_HOST.includes('staging')
const ZOPSMART_URL = 'https://zopsmart.com'
const GOOGLE_MAP_DEFAULT_KEY = 'AIzaSyBrTFsKMZamEgBbzUfcbCiVmbktgX7jUBU'
let GOOGLE_MAPS_URL = `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places,drawing&key=`
const WEBSOCKET_URL = process.env.REACT_APP_EVENTS_URL || 'wss://events.zopsmart.com/ws/store'
const BUGSNAG_KEY = process.env.REACT_APP_BUGSNAG_KEY || ''
const ZOPSMART_MAPS_URL = process.env.REACT_APP_MAPS_URL || 'http://maps.thor.zopsmart.com'
const GIT_HASH = process.env.REACT_APP_GIT_HASH
const GIT_TAG = process.env.REACT_APP_GIT_TAG
export {
  GO_HOST,
  ZOPSMART_URL,
  GOOGLE_MAPS_URL,
  BUGSNAG_KEY,
  WEBSOCKET_URL,
  ZOPSMART_MAPS_URL,
  GIT_HASH,
  GIT_TAG,
  IS_STAGING,
  GOOGLE_MAP_DEFAULT_KEY
}
