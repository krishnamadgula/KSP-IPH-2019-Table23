import cloneDeep from 'lodash.clonedeep'

/* State change bindings */
// When using these methods, bind them to component's own context
const getNestedState = function (keys) {
  let stateReference = this.state
  while (keys.length) {
    if (stateReference && (['boolean', 'string', 'number'].indexOf(typeof stateReference[keys[0]]) > -1)) {
      return stateReference[keys[0]]
    } else if (stateReference && (stateReference[keys[0]] || stateReference[keys[0]] === '')) {
      stateReference = stateReference[keys.shift()]
    } else {
      return null
    }
  }
  return stateReference
}

const updateStateRecursively = function (keys, value) {
  /*
    Just a method that can be used to update deeply nested state as well
    For example
    this.state['variants']['0']['price'] = value
    can be written as
    updateStateRecursively(['variants', 0, 'price'], value)
  */
  keys = keys.reverse()
  let _this = this
  this.setState(function (prevState) {
    let newState = Object.assign({}, prevState)
    let propertyToChange = newState
    while (keys.length) {
      if (keys.length === 1) {
        let lastKey = keys.pop()
        propertyToChange[lastKey] = value
        break
      } else {
        let key = keys.pop()
        // If the next key doesn't exist in the object, create an empty obj/arr
        let nextKey = keys.slice(-1).shift()
        if (nextKey !== undefined && (propertyToChange[key] === undefined || propertyToChange[key] === null)) {
          if (typeof nextKey === 'number') {
            propertyToChange[key] = []
          } else {
            propertyToChange[key] = {}
          }
        }
        propertyToChange = propertyToChange[key]
      }
    }
    if (_this.props.events && _this.props.events.onChange) {
      _this.props.events.onChange(_this.state.values)
    }
    return newState
  })
}
/* End of state change bindings */

// Method to compare 2 values, including objects
function compareValues (x, y) {
  // Compare primitives, or NaN
  if (Object.is(x, y)) {
    return true
  }

  // Compare built-ins
  if ((typeof x === 'function' && typeof y === 'function') ||
       (x instanceof Date && y instanceof Date) ||
       (x instanceof RegExp && y instanceof RegExp) ||
       (x instanceof String && y instanceof String) ||
       (x instanceof Number && y instanceof Number)) {
    return x.toString() === y.toString()
  }

  // Finally compare objects
  if (x instanceof Object && y instanceof Object) {
    let xkeys = Object.keys(x)
    let ykeys = Object.keys(y)
    if (xkeys.length !== ykeys.length) {
      return false
    } else {
      return xkeys.reduce((acc, key) => {
        return acc && compareValues(x[key], y[key])
      }, true)
    }
  }

  return false
}

function cloneMutables (sourceValues) {
  // TODO: Get a way around this 'hack' to leave immutable structures untouched
  let result = Object.assign({}, ...Object.keys(sourceValues).map(key => {
    if (sourceValues[key] instanceof Object && '_immutable' in sourceValues[key]) {
      return {
        [key]: sourceValues[key]
      }
    }
    return {
      [key]: cloneDeep(sourceValues[key])
    }
  }))
  return result
}

export {
  cloneMutables,
  compareValues,
  getNestedState,
  updateStateRecursively
}
