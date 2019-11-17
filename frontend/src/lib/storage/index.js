const set = (key, data) => {
  if (key && data) {
    window.localStorage.setItem(key, data)
    return true
  }
  console.error('Parameter Error - Please check set method')
  return false
}

const get = (key) => {
  if (key) {
    return window.localStorage.getItem(key)
  }
  console.error('Parameter Error -  Please check get method.')
  return false
}

const unset = (key) => {
  if (key) {
    window.localStorage.removeItem(key)
    return true
  }
  console.error('Parameter Error -  Please check unset method.')
  return false
}

export {
  set, get, unset
}
