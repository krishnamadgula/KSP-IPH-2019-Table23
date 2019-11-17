export function messageHandler (event) {
  // add a check here to allow only certain origins
  if (event.data === 'ZOPSMART_INTENAL_DASHBOARD_CLEAR_COOKIE') {
    window.localStorage.clear()
    event.source.postMessage('message', event.origin)
  }
}
